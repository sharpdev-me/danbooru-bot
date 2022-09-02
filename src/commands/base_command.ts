import { ApplicationCommandOption, ChatInputCommandInteraction, InteractionResponse, Message } from "discord.js";

export type ApplicationCommandStructure = {
    name: string;
    description: string;
    options?: ApplicationCommandOption[];
    default_member_permissions?: string;
    dm_permission?: boolean;
}

abstract class BaseCommand {
    constructor(public definition: ApplicationCommandStructure) { }

    abstract handle: (interaction: ChatInputCommandInteraction) => Promise<void | Message | InteractionResponse> | void;
}

export default BaseCommand;