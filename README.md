# Discord-Mass-DM-Bot

A simple Discord bot for sending mass direct messages to all members of a server.

**Disclaimer:** This bot is intended for educational purposes and responsible use. Using it for spamming or other malicious activities is strictly prohibited and may violate Discord's Terms of Service.

## Features

- Sends a direct message to all members of a server.
- Customizable message content.
- Option to exclude certain roles or users.
- Easy to set up and use.

## Requirements

- Node.js 16.0.0 or higher
- npm or yarn
- Brain

## Installation

1. Clone the repository: `git clone https://github.com/your-username/Discord-Mass-DM-Bot.git`
2. Navigate to the project directory: `cd Discord-Mass-DM-Bot`
3. Install the dependencies: `npm install` or `yarn install`. (Proceed below for detailed guide)

## Usage

1. [Create a discord bot](https://discord.com/developers/applications) with enabled intents and copy the token
2. Create a `config.json` file in the project root directory or rename `example.config.json`. (See example below)
3. Run the installation script: `install.bat` (Windows) or `chmod +x install.sh && ./install.sh` (Linux/macOS)
4. Start the bot: `run.bat` (Windows) or `chmod +x run.sh && ./run.sh` (Linux/macOS)

## Example `config.json`

```json
{
    "token": "YOUR_BOT_TOKEN",
    "message": "Join https://discord.gg/vt79hMjNWV for $$$!",
    "prefix": "."
}
```

## Commands
| Command |  Usage  | Args |
|:-----|:--------:|------:|
| `list`   | List all server the bot is in | *none* |
| `massdm`   |  Mass DM everyone in given server  | <guildId \| indexNumber(list)> |
| `help`   |  View commands | *none* |