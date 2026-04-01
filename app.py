import webview
import subprocess
import json
import os
import tempfile

BUN = '/home/jefferson/.bun/bin/bun'
BASE = '/home/jefferson/mouse-config'
PROFILES_DIR = BASE + '/profiles'
UI_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ui')


def run_ts(path):
    result = subprocess.run(
        ['sudo', BUN, path],
        capture_output=True,
        text=True,
        timeout=25
    )
    return result


def build_apply_script(d):
    polling_rate = d.get('polling_rate', d.get('pollingRate'))
    dpi_values = d.get('dpi_values', d.get('dpiValues'))
    active_stage = d.get('active_stage', d.get('activeStage'))
    light_mode = d.get('light_mode', d.get('lightMode'))
    rgb = d.get('rgb', [255, 255, 255])
    led_speed = d.get('led_speed', d.get('ledSpeed'))
    sleep_time = d.get('sleep_time', d.get('sleepTime'))
    deep_sleep = d.get('deep_sleep', d.get('deepSleep'))
    key_response = d.get('key_response', d.get('keyResponse'))

    lines = [
        "import { AttackSharkX11, ConnectionMode, Rate, LightMode } from 'attack-shark-x11-driver';",
        "const driver = new AttackSharkX11({ connectionMode: ConnectionMode.Adapter, delayMs: 500 });",
        "try {",
        "  await driver.open();",
        f"  await driver.setPollingRate(Rate.{polling_rate});",
        f"  await driver.setDpi({{ dpiValues: {dpi_values}, activeStage: {active_stage} }});",
        "  await driver.setUserPreferences({",
        f"    lightMode: LightMode.{light_mode},",
        f"    rgb: {{ r: {rgb[0]}, g: {rgb[1]}, b: {rgb[2]} }},",
        f"    ledSpeed: {led_speed},",
        f"    sleepTime: {sleep_time},",
        f"    deepSleepTime: {deep_sleep},",
        f"    keyResponse: {key_response}",
        "  });",
        "  console.log('OK');",
        "} catch(e) {",
        "  console.error(e?.message || e);",
        "}",
        "finally {",
        "  await driver.close();",
        "}",
    ]
    return "\n".join(lines)


def build_reset_script():
    return "\n".join([
        "import { AttackSharkX11, ConnectionMode } from 'attack-shark-x11-driver';",
        "const driver = new AttackSharkX11({ connectionMode: ConnectionMode.Adapter, delayMs: 500 });",
        "try {",
        "  await driver.open();",
        "  await driver.reset();",
        "  console.log('OK');",
        "} catch(e) {",
        "  console.error(e?.message || e);",
        "}",
        "finally {",
        "  await driver.close();",
        "}",
    ])


class Api:
    def get_battery(self):
        try:
            result = subprocess.run(
                ['sudo', BUN, BASE + '/battery.ts'],
                capture_output=True,
                text=True,
                timeout=15
            )
            return {'ok': True, 'value': int(result.stdout.strip())}
        except Exception as e:
            return {'ok': False, 'error': str(e)}

    def apply(self, data):
        try:
            print('DATA RECEBIDA DO FRONT:', data)

            script = build_apply_script(data)

            with tempfile.NamedTemporaryFile(
                mode='w',
                suffix='.ts',
                dir=BASE,
                delete=False
            ) as f:
                f.write(script)
                path = f.name

            result = run_ts(path)
            os.unlink(path)

            stdout = result.stdout.strip()
            stderr = result.stderr.strip()

            print('STDOUT:', stdout)
            print('STDERR:', stderr)

            return {
                'ok': 'OK' in stdout,
                'output': stdout,
                'error': stderr
            }

        except Exception as e:
            return {'ok': False, 'error': str(e)}

    def reset(self):
        try:
            with tempfile.NamedTemporaryFile(
                mode='w',
                suffix='.ts',
                dir=BASE,
                delete=False
            ) as f:
                f.write(build_reset_script())
                path = f.name

            result = run_ts(path)
            os.unlink(path)

            return {
                'ok': 'OK' in result.stdout,
                'output': result.stdout.strip(),
                'error': result.stderr.strip()
            }

        except Exception as e:
            return {'ok': False, 'error': str(e)}

    def list_profiles(self):
        os.makedirs(PROFILES_DIR, exist_ok=True)
        return [
            f.replace('.json', '')
            for f in os.listdir(PROFILES_DIR)
            if f.endswith('.json')
        ]

    def save_profile(self, name, data):
        try:
            os.makedirs(PROFILES_DIR, exist_ok=True)
            with open(PROFILES_DIR + '/' + name + '.json', 'w') as f:
                json.dump(data, f, indent=2)
            return {'ok': True}
        except Exception as e:
            return {'ok': False, 'error': str(e)}

    def load_profile(self, name):
        path = PROFILES_DIR + '/' + name + '.json'
        if os.path.exists(path):
            with open(path) as f:
                return {'ok': True, 'data': json.load(f)}
        return {'ok': False, 'error': 'Nao encontrado'}

    def delete_profile(self, name):
        try:
            path = PROFILES_DIR + '/' + name + '.json'
            if os.path.exists(path):
                os.remove(path)
            return {'ok': True}
        except Exception as e:
            return {'ok': False, 'error': str(e)}

    def notify_low_battery(self, value):
        try:
            subprocess.run([
                'notify-send',
                'Attack Shark X11',
                f'Bateria baixa: {value}%!',
                '--urgency=critical'
            ])
        except Exception:
            pass
        return {'ok': True}


if __name__ == '__main__':
    api = Api()
    webview.create_window(
        'Attack Shark X11 — Configurador',
        url='file://' + UI_DIR + '/index.html',
        js_api=api,
        width=660,
        height=780,
        resizable=True
    )
    webview.start(debug=False)
