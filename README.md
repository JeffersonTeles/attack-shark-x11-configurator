# Attack Shark X11 Configurator (Linux)

[![Linux](https://img.shields.io/badge/Platform-Linux-FCC624?logo=linux&logoColor=black)](https://www.kernel.org/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Bun](https://img.shields.io/badge/Runtime-Bun-fbf0df?logo=bun&logoColor=black)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Aplicativo desktop nativo para distribuições Linux projetado para configuração e personalização completa do mouse gamer sem fio **Attack Shark X11**, suprindo a ausência de software proprietário oficial do fabricante para a plataforma Linux.

Combina uma interface gráfica moderna renderizada via WebKit (`pywebview`) com um driver de comunicação em baixo nível via descritores HID (`/dev/hidraw*`) executado via Bun e TypeScript.

---

## 🎯 Funcionalidades

- **Ajuste de DPI por Estágios:** Configuração de 6 níveis de DPI independentes (400 até 22.000 DPI) com seleção rápida do estágio ativo.
- **Taxa de Sondagem (Polling Rate):** Alternância instantânea entre taxas de atualização (`eSports` / 1000Hz, `gaming` / 500Hz, `office` / 125Hz).
- **Iluminação & Efeitos RGB:** Controle de modos de luz (`Neon`, `Breathing`, `Static`, `Off`), seleção de cor personalizada (RGB) e velocidade do LED.
- **Gerenciamento de Energia:** Ajuste fino dos tempos de suspensão leve (*sleep*) e suspensão profunda (*deep sleep*).
- **Tempo de Resposta (*Debounce*):** Calibração de tempo de resposta dos botões (4ms a 50ms) para eliminar duplo clique acidental.
- **Telemetria de Bateria:** Monitoramento de carga do periférico em tempo real com alerta visual via `notify-send` em caso de bateria crítica.
- **Perfis de Configuração:** Exportação e importação de perfis personalizados em JSON (ex.: *Jogos*, *Trabalho*, *Economia*).

---

## 🏛️ Arquitetura

```text
├── app.py                 # Orquestrador desktop (pywebview + ponte RPC Python-JS)
├── ui/                    # Interface gráfica responsiva (HTML5/CSS3/JavaScript)
├── battery.ts             # Script de leitura de nível de carga via HID
├── run.sh                 # Launcher com elevação gráfica via PolicyKit (pkexec)
└── package.json           # Dependências do driver Attack Shark X11
```

---

## ⚙️ Requisitos do Sistema

- Distribuição Linux (Ubuntu, Debian, Fedora, Pop!_OS, Zorin OS, Arch, etc.)
- Python 3.10+
- [Bun](https://bun.sh)
- Bibliotecas gráficas: `gir1.2-webkit2-4.1` ou backend Qt

---

## 🚀 Instalação e Execução

### 1. Clonar repositório e instalar dependências

```bash
# Clone o repositório
git clone https://github.com/JeffersonTeles/attack-shark-x11-configurator.git
cd attack-shark-x11-configurator

# Instale o Bun (caso não possua)
curl -fsSL https://bun.sh/install | bash && source ~/.bashrc

# Instale as dependências do driver
bun install

# Instale a biblioteca pywebview
pip install pywebview
```

### 2. Executar aplicação

```bash
# Execução direta com elevação gráfica PolicyKit
./run.sh

# Ou via Python com elevação:
pkexec env DISPLAY=$DISPLAY XAUTHORITY=$XAUTHORITY python3 app.py
```

---

## 🖥️ Instalação no Menu de Aplicativos (.desktop)

Para integrar o aplicativo diretamente ao inicializador do sistema operacional:

```bash
cat > ~/.local/share/applications/attack-shark-x11.desktop << EOF
[Desktop Entry]
Type=Application
Name=Attack Shark X11 Configurator
Comment=Configurador de DPI, RGB e Polling Rate do mouse Attack Shark X11
Exec=$(pwd)/run.sh
Terminal=false
Icon=preferences-desktop-peripherals
Categories=Settings;HardwareSettings;
EOF

chmod +x ~/.local/share/applications/attack-shark-x11.desktop
```

---

## 🔒 Permissões e Regras Udev (Sem Root)

Caso prefira operar sem elevação de privilégios (`pkexec`/`sudo`), configure uma regra udev para conceder acesso ao grupo de usuários:

```bash
sudo tee /etc/udev/rules.d/99-attack-shark-x11.rules << 'EOF'
KERNEL=="hidraw*", ATTRS{idVendor}=="*", ATTRS{idProduct}=="*", MODE="0666"
EOF

sudo udevadm control --reload-rules && sudo udevadm trigger
```

---

## 📄 Licença

Distribuído sob licença MIT. Consulte `LICENSE` para mais detalhes.
