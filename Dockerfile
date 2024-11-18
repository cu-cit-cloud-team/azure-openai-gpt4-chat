ARG NODE_VERSION="22"
ARG VARIANT="${NODE_VERSION}-bookworm"

FROM mcr.microsoft.com/devcontainers/typescript-node:1-${VARIANT}

# install some common utils
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
  && apt-get -y install --no-install-recommends ca-certificates software-properties-common gnupg curl wget zip unzip git jq nano vim zsh

# install github cli
RUN export DEBIAN_FRONTEND=noninteractive \
  && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt-get update \
  && sudo apt-get -y install gh

# update npm and install some global packages
USER node
RUN npm install -g npm diff-so-fancy npm-check-updates

# install oh-my-zsh
USER root
RUN rm -rf ~/.oh-my-zsh \
  && sh -c "$(wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)" --unattended \
  && chsh -s /bin/zsh

# customize oh-my-zsh
USER node
RUN git clone --quiet https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions \
  && git clone --quiet https://github.com/zsh-users/zsh-completions ~/.oh-my-zsh/custom/plugins/zsh-completions \
  && sed -i 's/ZSH_THEME="devcontainers"/ZSH_THEME=""/g' ~/.zshrc \
  && sed -i 's/# HYPHEN_INSENSITIVE=/HYPHEN_INSENSITIVE=/g' ~/.zshrc \
  && sed -i 's/plugins=(git)/plugins=(git zsh-completions zsh-autosuggestions npm)/g' ~/.zshrc \
  && sed -i '/plugins=(git zsh-completions zsh-autosuggestions npm`)/a autoload -U compinit && compinit' ~/.zshrc

# set some shell aliases/options and set some git aliases/options
USER node
RUN echo '\nalias la="ls -lah"\nalias cl="clear"\nalias npmgls="npm -g ls --depth=0"' >> ~/.zshrc \
  && echo '\nalias aptupdate="apt update && apt upgrade"' >> ~/.zshrc \
  && echo '\nalias alias ncud="ncu --dep dev -u && npm install"\nalias ncup="ncu --dep prod -u && npm install"' >> ~/.zshrc \
  && echo '\n\nexport LS_COLORS="su=00:sg=00:ca=00:ow=01;36;40"' >> ~/.zshrc \
  && echo '\nzstyle ":completion:*" list-colors "${(@s.:.)LS_COLORS}"' >> ~/.zshrc \
  && echo '\n\neval "$(gh completion --shell zsh)"\n' >> ~/.zshrc \
  && git config  --global --add alias.st status \
  && git config  --global --add alias.co checkout \
  && git config  --global --add alias.br branch \
  && git config --global --add alias.lsd 'log --pretty=format:"%C(yellow)%h%Cred%d\\ %Creset%s%Cblue\\ [%cn]" --decorate' \
  && git config --global --add commit.gpgsign true \
  && git config --global --add tag.gpgsign true \
  && git config --global --add tag.tag.forcesignannotated true \
  && git config --global --add core.pager "diff-so-fancy | less --tabs=4 -RFX"

# install starship shell prompt
USER root
RUN sh -c "$(curl -fsSL https://starship.rs/install.sh)" -- --yes

# add starship to zshrc
USER node
RUN echo '\neval "$(starship init zsh)"\n' >> ~/.zshrc

# add config file for starship
COPY starship.toml  ~/.config/starship.toml
