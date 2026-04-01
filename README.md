# Attack Shark X11 Configurator

Aplicativo desktop Linux para configurar o mouse Attack Shark X11.

## Requisitos

- Linux
- Python 3.10+
- [Bun](https://bun.sh)

## Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/JeffersonTeles/attack-shark-x11-configurator.git
cd attack-shark-x11-configurator

# 2. Instale o Bun
curl -fsSL https://bun.sh/install | bash && source ~/.bashrc

# 3. Instale as dependências JS
bun install

# 4. Instale o pywebview
pip install pywebview[qt]
```

## Executando

```bash
sudo python3 app.py
```

## Atalho na Área de Trabalho

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

## Observações

- Ajuste o caminho do Bun em `app.py` se necessário (`which bun`)
- Requer `sudo` para comunicação com o mouse
