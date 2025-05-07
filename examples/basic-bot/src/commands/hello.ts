import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from '@electr0zed/discord-interactions-cf';

const cmd = new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Says hello to the user')

cmd.setExecute(async (interaction, env) => {
    const embed = new EmbedBuilder()
        .setTitle('Hello!')
        .setDescription('Hello, world!')
        .setColor(0x0099ff);

    await interaction.reply({
        embeds: [embed],
        components: [
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('hello')
                        .setLabel('Say hello')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('world:extrainfo')
                        .setLabel('Say world')
                        .setStyle(ButtonStyle.Secondary),
                )
        ]
    });
});


export default cmd;