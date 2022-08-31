import { ApplicationCommandOption, ChatInputCommandInteraction } from "discord.js";

type ApplicationCommandStructure = {
    name: string;
    description: string;
    options?: ApplicationCommandOption[];
}

abstract class BaseCommand {
    constructor(public definition: ApplicationCommandStructure) { }

    abstract handle: (interaction: ChatInputCommandInteraction) => void;
}

export default BaseCommand;