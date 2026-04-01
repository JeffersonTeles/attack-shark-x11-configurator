# Attack Shark X11 Configurator

Aplicativo desktop para Linux para configurar o **Attack Shark X11**, desenvolvido com **Python + pywebview** para a interface e **Bun + TypeScript** para comunicação com o driver do mouse.

Este projeto permite:
- Ler o nível da bateria
- Alterar a taxa de polling
- Configurar estágios de DPI
- Aplicar iluminação e preferências do usuário
- Salvar e carregar perfis locais

## Funcionalidades

- Interface desktop com Python, HTML, CSS e JavaScript
- Uso do `pywebview` para abrir a interface web em uma janela nativa no Linux [web:45]
- Uso do Bun para executar arquivos TypeScript diretamente, sem precisar compilar manualmente antes [web:49][web:54]
- Suporte a perfis salvos localmente
- Foco em ambiente Linux

## Requisitos

Antes de rodar o projeto, você precisa ter:

- Linux
- Python 3.10 ou superior, de preferência
- `pip`
- Bun instalado
- Permissão para usar `sudo`
- Mouse Attack Shark X11
- Dependências JavaScript do projeto instaladas

## Estrutura do projeto

```text
attack-shark-x11-configurator/
├── app.py
├── ui/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── battery.ts
├── package.json
├── bun.lockb / bun.lock
└── profiles/
```

## Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/JeffersonTeles/attack-shark-x11-configurator.git
cd attack-shark-x11-configurator
```

### 2. Instalar o Bun

O Bun é usado para executar os scripts TypeScript que conversam com o driver do mouse. A instalação oficial no Linux é feita com o script do projeto, e a documentação também informa que o pacote `unzip` pode ser necessário. [web:51][web:54]

Se necessário, instale o `unzip` antes:

```bash
sudo apt update
sudo apt install -y unzip
```

Agora instale o Bun:

```bash
curl -fsSL https://bun.sh/install | bash
```

Depois recarregue o terminal:

```bash
source ~/.bashrc
```

Se você usa Zsh:

```bash
source ~/.zshrc
```

Confira se funcionou:

```bash
bun --version
```

### 3. Instalar as dependências JavaScript

Com o Bun já instalado, rode:

```bash
bun install
```

Esse comando instala as dependências definidas no `package.json`, incluindo o pacote usado para comunicação com o mouse. [web:49][web:54]

### 4. Instalar as dependências Python

O projeto usa `pywebview` para abrir a interface em uma janela desktop. No Linux, a documentação do pywebview informa que você precisa escolher explicitamente um backend, como **Qt** ou **GTK**, e `pywebview[qt]` costuma ser a opção mais prática. [web:45][web:48]

Instalação recomendada:

```bash
python3 -m pip install pywebview[qt]
```

Se essa instalação não resolver sozinha no seu sistema, instale também os pacotes do Qt manualmente.

Exemplo para Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y python3-pyqt5 python3-pyqt5.qtwebkit libqt5webkit5-dev
python3 -m pip install pywebview
```

### 5. Testar se o pywebview foi instalado corretamente

```bash
python3 -c "import webview; print('pywebview OK')"
```

Se aparecer `pywebview OK`, a biblioteca está funcionando no Python. [web:45]

### 6. Ajustar o caminho do Bun no `app.py`

Atualmente o projeto usa um caminho fixo para o Bun dentro do arquivo `app.py`:

```python
BUN = '/home/jefferson/.bun/bin/bun'
```

Se outra pessoa for usar o projeto, provavelmente vai precisar trocar esse caminho para o ambiente dela.

Para descobrir o caminho correto no seu sistema:

```bash
which bun
```

Se necessário, atualize a variável `BUN` no `app.py` com o resultado exibido.

Exemplo:

```python
BUN = '/home/seu-usuario/.bun/bin/bun'
```

### 7. Ajustar o caminho base do projeto no `app.py`

O projeto também usa um caminho fixo para a pasta base:

```python
BASE = '/home/jefferson/mouse-config'
```

Se você clonou o projeto em outra pasta, altere esse valor para o caminho correto no seu computador.

Exemplo:

```python
BASE = '/home/seu-usuario/attack-shark-x11-configurator'
```

### 8. Criar a pasta de perfis, se necessário

Se a pasta `profiles` ainda não existir, crie com:

```bash
mkdir -p profiles
```

## Como executar

Depois de instalar tudo e ajustar os caminhos no `app.py`, rode:

```bash
sudo python3 app.py
```

O uso de `sudo` faz parte da configuração atual do projeto, porque a camada que conversa com o mouse é executada com privilégios elevados.

Se tudo estiver configurado corretamente, a janela do aplicativo deve abrir com a interface de configuração do mouse.

## Como usar

### Alterar polling rate
Escolha a taxa de polling na interface e aplique as configurações.

### Configurar DPI
Defina os valores dos estágios de DPI e escolha qual estágio ficará ativo.

### Configurar iluminação
Ajuste modo de luz, cor RGB, velocidade do LED, tempo de suspensão, deep sleep e resposta de clique.

### Salvar perfis
Salve as configurações atuais com um nome para reutilizar depois.

### Carregar perfis
Carregue perfis já salvos na pasta `profiles/`.

## Solução de problemas

### Bun não encontrado

Se aparecer erro dizendo que o Bun não foi encontrado:

```bash
which bun
```

Depois atualize a variável `BUN` no `app.py` com o caminho correto. [web:54]

### Erro `No module named webview`

Instale o `pywebview` novamente:

```bash
python3 -m pip install pywebview[qt]
```

Se ainda falhar, instale também os pacotes de backend do Qt no sistema, porque no Linux o pywebview depende desse backend gráfico. [web:45][web:48]

### A janela abre, mas a interface não carrega

Verifique se a pasta `ui/` existe e se o arquivo `index.html` está presente.

Confira também se esta linha do `app.py` está correta:

```python
url='file://' + UI_DIR + '/index.html'
```

### O comando funciona no terminal, mas falha no aplicativo

Teste primeiro os scripts TypeScript diretamente no terminal com o Bun:

```bash
sudo bun battery.ts
```

ou:

```bash
sudo /home/seu-usuario/.bun/bin/bun battery.ts
```

Se funcionar no terminal e falhar no app, geralmente o problema está no caminho configurado no `app.py`.

### Problemas de permissão

Se o aplicativo só funcionar com `sudo`, isso é esperado na configuração atual, porque o acesso ao dispositivo está sendo feito com privilégios elevados.

### Problemas com backend do pywebview no Linux

A documentação do pywebview informa que, no Linux, é necessário usar explicitamente um backend como Qt ou GTK. Se o backend padrão não funcionar, ajuste a instalação conforme o ambiente da sua distribuição. [web:45][web:48]

## Desenvolvimento

Para atualizar o projeto no GitHub depois de fazer mudanças:

```bash
git add .
git commit -m "Descreva sua alteração"
git push
```

## Observações

- Este projeto foi pensado para Linux.
- Os caminhos definidos em `app.py` podem precisar ser ajustados para cada máquina.
- Atualmente o fluxo usa `sudo` para conseguir acessar o dispositivo.
- A Attack Shark também mantém uma página oficial de downloads de drivers, firmware, software e manuais para seus dispositivos. [web:52][web:58]
