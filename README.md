# Attack Shark X11 Configurator (Linux)

Aplicativo desktop para distribuições Linux para configuração e personalização do mouse gamer sem fio **Attack Shark X11**, suprindo a ausência de software proprietário oficial do fabricante para a plataforma.

---

## 🎯 Funcionalidades

- **Ajuste de DPI por Estágios:** Configuração de 6 níveis de DPI independentes (400 até 22.000 DPI) com seleção rápida do estágio ativo.
- **Taxa de Sondagem (Polling Rate):** Alternância entre taxas de atualização (`eSports` / 1000Hz, `gaming` / 500Hz, `office` / 125Hz).
- **Iluminação & Efeitos RGB:** Controle de modos de luz (`Neon`, `Breathing`, `Static`, `Off`), seleção de cor personalizada (RGB) e velocidade do LED.
- **Gerenciamento de Energia:** Ajuste dos tempos de suspensão leve (*sleep*) e suspensão profunda (*deep sleep*).
- **Tempo de Resposta (*Debounce*):** Ajuste de tempo de resposta dos botões (4ms a 50ms) para evitar duplo clique acidental.
- **Leitura de Bateria & Notificações:** Exibição da porcentagem de bateria do periférico e alerta visual no sistema via `notify-send` em caso de bateria crítica.
- **Perfis de Configuração:** Salve, carregue e exclua perfis personalizados em JSON (ex.: *Jogos*, *Trabalho*, *Economia*).

---

## ⚙️ Requisitos

- Distribuição Linux (Ubuntu, Debian, Fedora, Pop!_OS, etc.)
- Python 3.10+
- [Bun](https://bun.sh)
- Bibliotecas do sistema: `gir1.2-webkit2-4.1` ou Qt para renderização via WebKit

---

## 🚀 Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/JeffersonTeles/attack-shark-x11-configurator.git
cd attack-shark-x11-configurator

# 2. Instale o Bun (caso ainda não possua)
curl -fsSL https://bun.sh/install | bash && source ~/.bashrc

# 3. Instale as dependências JS / Driver
bun install

# 4. Instale o pywebview
pip install pywebview
```

---

## 💻 Executando

```bash
sudo python3 app.py
```

---

## 🖥️ Atalho na Área de Trabalho

```bash
cat > run.sh << 'EOF'
#!/bin/bash
pkexec env DISPLAY=$DISPLAY XAUTHORITY=$XAUTHORITY python3 $(pwd)/app.py
EOF
chmod +x run.sh

cat > ~/.local/share/applications/attack-shark-x11.desktop << EOF
[Desktop Entry]
Type=Application
Name=Attack Shark X11
Exec=$(pwd)/run.sh
Terminal=false
Icon=preferences-desktop-peripherals
EOF

DESKTOP=$(xdg-user-dir DESKTOP)
cp ~/.local/share/applications/attack-shark-x11.desktop "$DESKTOP/Attack Shark X11.desktop"
chmod +x "$DESKTOP/Attack Shark X11.desktop"
gio set "$DESKTOP/Attack Shark X11.desktop" metadata::trusted true
```

---

## ⚠️ Observações Técnicas

- Ajuste o caminho do Bun em `app.py` se necessário (`which bun`).
- A comunicação com os descritores de dispositivos HID em `/dev/hidraw*` requer elevação de privilégios (`sudo` ou `pkexec`).
