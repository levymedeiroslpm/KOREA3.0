// ===============================
// BOT FAC RP - SISTEMA COMPLETO
// ===============================

require('dotenv').config();

const express = require('express');

const {
    Client,
    GatewayIntentBits,
    Partials,
    Events,

    REST,
    Routes,
    SlashCommandBuilder,

    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,

    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,

    ChannelType,
    PermissionFlagsBits

} = require('discord.js');

// ===============================
// EXPRESS / RENDER
// ===============================

const app = express();

app.get('/', (req, res) => {
    res.send('KOREA BOT ONLINE');
});

app.listen(3000, () => {
    console.log('Servidor web ligado.');
});

// ===============================
// CONFIG
// ===============================

const TOKEN = process.env.TOKEN;

const CLIENT_ID = process.env.CLIENT_ID || '1507961405545119814';
const GUILD_ID = process.env.GUILD_ID || '1505576877505646702';

const CARGO_STAFF = process.env.CARGO_STAFF || '1505576877505646711';
const CARGO_SEM_CARGO = process.env.CARGO_SEM_CARGO || '1505576877505646703';
const CARGO_MEMBRO = process.env.CARGO_MEMBRO || '1505576877505646707';

const CANAL_PARCERIA = process.env.CANAL_PARCERIA || '1505576878541635651';
const CANAL_LOGS = process.env.CANAL_LOGS || '1505576878759612417';
const CANAL_ENTRADA_SAIDA = process.env.CANAL_ENTRADA_SAIDA || '1505576877958496258';
const CANAL_SUGESTOES = process.env.CANAL_SUGESTOES || '1505576878541635647';
const CANAL_PUNICOES = process.env.CANAL_PUNICOES || '1505576878541635649';
const CANAL_AUSENCIA = process.env.CANAL_AUSENCIA || '1505576877958496259';
const CANAL_BAU_LOG = process.env.CANAL_BAU_LOG || '1505576878759612417';
const CANAL_VENDAS = process.env.CANAL_VENDAS || '1505576878759612419';
const CANAL_METAS = process.env.CANAL_METAS || '1505576879778824368';
const CANAL_TABELA_PRECOS = process.env.CANAL_TABELA_PRECOS || '1505576878759612421';

const CATEGORIA_TICKETS = process.env.CATEGORIA_TICKETS || '1505576879099216079';

// ===============================
// CLIENT
// ===============================

const client = new Client({

    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],

    partials: [Partials.Channel]

});

// ===============================
// HELPERS
// ===============================

function makeEmbed(title, description, color = 'DarkRed') {

    return new EmbedBuilder()

    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();

}

async function safeReply(interaction, options) {

    try {

        if (interaction.replied || interaction.deferred) {
            return interaction.followUp(options);
        }

        return interaction.reply(options);

    } catch (err) {

        console.log(err);

    }

}

function onlyStaff(interaction) {

    return interaction.member.roles.cache.has(CARGO_STAFF);

}

// ===============================
// COMANDOS
// ===============================

const commands = [

    new SlashCommandBuilder()
    .setName('set')
    .setDescription('Painel de set'),

    new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Painel de ticket'),

    new SlashCommandBuilder()
    .setName('parceria')
    .setDescription('Painel de parceria'),

    new SlashCommandBuilder()
    .setName('ausencia')
    .setDescription('Painel de ausência'),

    new SlashCommandBuilder()
    .setName('punicao')
    .setDescription('Painel de punição'),

    new SlashCommandBuilder()
    .setName('sugestao')
    .setDescription('Painel de sugestão'),

    new SlashCommandBuilder()
    .setName('bau')
    .setDescription('Painel do baú'),

    new SlashCommandBuilder()
    .setName('venda')
    .setDescription('Painel de vendas'),

    new SlashCommandBuilder()
    .setName('meta')
    .setDescription('Painel de metas'),

    new SlashCommandBuilder()
    .setName('tabela')
    .setDescription('Enviar tabela de preços')

];

// ===============================
// REGISTRAR COMANDOS
// ===============================

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {

    try {

        console.log('Registrando comandos...');

        await rest.put(

            Routes.applicationGuildCommands(
                CLIENT_ID,
                GUILD_ID
            ),

            { body: commands.map(cmd => cmd.toJSON()) }

        );

        console.log('Comandos registrados.');

    } catch (err) {

        console.log(err);

    }

})();

// ===============================
// READY
// ===============================

client.once(Events.ClientReady, () => {

    console.log(`Bot online: ${client.user.tag}`);

});

// ===============================
// ENTRADA
// ===============================

client.on(Events.GuildMemberAdd, async member => {

    try {

        await member.roles.add(CARGO_SEM_CARGO);

        const canal =
        member.guild.channels.cache.get(CANAL_ENTRADA_SAIDA);

        if (!canal) return;

        const embed = new EmbedBuilder()

        .setTitle('👋 Bem-vindo à KOREA')

        .setDescription(

            `🇰🇷 Salve ${member}\n\n` +

            `Você acabou de entrar no servidor.\n\n` +

            `📌 Vá até o painel de set e solicite sua liberação.\n\n` +

            `🔥 Boa sorte na cidade.`

        )

        .setThumbnail(
            member.user.displayAvatarURL({ dynamic: true })
        )

        .setColor('Green')

        .setTimestamp();

        canal.send({
            embeds: [embed]
        });

    } catch (err) {

        console.log(err);

    }

});

// ===============================
// SAÍDA
// ===============================

client.on(Events.GuildMemberRemove, async member => {

    const canal =
    member.guild.channels.cache.get(CANAL_ENTRADA_SAIDA);

    if (!canal) return;

    const embed = new EmbedBuilder()

    .setTitle('👋 Um membro saiu')

    .setDescription(

        `😢 ${member.user.tag} nos deixou.`

    )

    .setThumbnail(
        member.user.displayAvatarURL({ dynamic: true })
    )

    .setColor('Red')

    .setTimestamp();

    canal.send({
        embeds: [embed]
    });

});

// ===============================
// INTERAÇÕES
// ===============================

client.on(Events.InteractionCreate, async interaction => {

    try {

        // ===========================
        // SLASH COMMANDS
        // ===========================

        if (interaction.isChatInputCommand()) {

            if (!onlyStaff(interaction)) {

                return safeReply(interaction, {

                    content: '❌ Apenas staff.',
                    ephemeral: true

                });

            }

            // =======================
            // /SET
            // =======================

            if (interaction.commandName === 'set') {

                const embed = makeEmbed(

                    '📌 PAINEL DE SET',

                    'Clique abaixo para solicitar sua setagem.',

                    'DarkRed'

                );

                const row = new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                    .setCustomId('abrir_set')

                    .setLabel('SOLICITAR SET')

                    .setStyle(ButtonStyle.Danger)

                );

                await interaction.channel.send({

                    embeds: [embed],
                    components: [row]

                });

                return safeReply(interaction, {

                    content: '✅ Painel enviado.',
                    ephemeral: true

                });

            }

            // =======================
            // /TICKET
            // =======================

            if (interaction.commandName === 'ticket') {

                const embed = makeEmbed(

                    '📣 SUPORTE',

                    'Clique abaixo para abrir ticket.',

                    'Blue'

                );

                const row = new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                    .setCustomId('abrir_ticket')

                    .setLabel('ABRIR TICKET')

                    .setStyle(ButtonStyle.Primary)

                );

                await interaction.channel.send({

                    embeds: [embed],
                    components: [row]

                });

                return safeReply(interaction, {

                    content: '✅ Painel enviado.',
                    ephemeral: true

                });

            }

            // =======================
            // /PARCERIA
            // =======================

            if (interaction.commandName === 'parceria') {

                const embed = makeEmbed(

                    '🤝 PARCERIA',

                    'Clique abaixo para enviar parceria.',

                    'Green'

                );

                const row = new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                    .setCustomId('abrir_parceria')

                    .setLabel('ENVIAR PARCERIA')

                    .setStyle(ButtonStyle.Success)

                );

                await interaction.channel.send({

                    embeds: [embed],
                    components: [row]

                });

                return safeReply(interaction, {

                    content: '✅ Painel enviado.',
                    ephemeral: true

                });

            }

            // =======================
            // TABELA
            // =======================

            if (interaction.commandName === 'tabela') {

                const canal =
                interaction.guild.channels.cache.get(
                    CANAL_TABELA_PRECOS
                );

                if (!canal) return;

                const embed = new EmbedBuilder()

                .setTitle('💸 TABELA DE PREÇOS')

                .setDescription(

                    `📦 PRODUTO 1 - R$0\n` +
                    `📦 PRODUTO 2 - R$0\n` +
                    `📦 PRODUTO 3 - R$0`

                )

                .setColor('Green');

                canal.send({
                    embeds: [embed]
                });

                return safeReply(interaction, {

                    content: '✅ Tabela enviada.',
                    ephemeral: true

                });

            }

        }

        // ===========================
        // BOTÕES
        // ===========================

        if (interaction.isButton()) {

            // =======================
            // ABRIR SET
            // =======================

            if (interaction.customId === 'abrir_set') {

                const modal = new ModalBuilder()

                .setCustomId('modal_set')

                .setTitle('Solicitação de Set');

                const nome = new TextInputBuilder()

                .setCustomId('nome')

                .setLabel('Nome no jogo')

                .setStyle(TextInputStyle.Short)

                .setRequired(true);

                const id = new TextInputBuilder()

                .setCustomId('id')

                .setLabel('ID do jogo')

                .setStyle(TextInputStyle.Short)

                .setRequired(true);

                modal.addComponents(

                    new ActionRowBuilder()
                    .addComponents(nome),

                    new ActionRowBuilder()
                    .addComponents(id)

                );

                return interaction.showModal(modal);

            }

            // =======================
            // ABRIR TICKET
            // =======================

            if (interaction.customId === 'abrir_ticket') {

                const canal =
                await interaction.guild.channels.create({

                    name:
                    `ticket-${interaction.user.username}`,

                    type: ChannelType.GuildText,

                    parent: CATEGORIA_TICKETS,

                    permissionOverwrites: [

                        {
                            id: interaction.guild.id,

                            deny: [
                                PermissionFlagsBits.ViewChannel
                            ]
                        },

                        {
                            id: interaction.user.id,

                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages
                            ]
                        },

                        {
                            id: CARGO_STAFF,

                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages
                            ]
                        }

                    ]

                });

                const row = new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                    .setCustomId('fechar_ticket')

                    .setLabel('FECHAR')

                    .setStyle(ButtonStyle.Secondary)

                );

                canal.send({

                    content:
                    `<@&${CARGO_STAFF}> ${interaction.user}`,

                    embeds: [

                        makeEmbed(

                            '📣 TICKET ABERTO',

                            'Aguarde a staff.',

                            'Blue'

                        )

                    ],

                    components: [row]

                });

                return safeReply(interaction, {

                    content:
                    `✅ Ticket criado: ${canal}`,

                    ephemeral: true

                });

            }

        }

        // ===========================
        // MODAL SET
        // ===========================

        if (interaction.isModalSubmit()) {

            // =======================
            // SET
            // =======================

            if (interaction.customId === 'modal_set') {

                const nome =
                interaction.fields.getTextInputValue('nome');

                const id =
                interaction.fields.getTextInputValue('id');

                const canal =
                await interaction.guild.channels.create({

                    name:
                    `set-${interaction.user.username}`,

                    type: ChannelType.GuildText,

                    parent: CATEGORIA_TICKETS,

                    permissionOverwrites: [

                        {
                            id: interaction.guild.id,

                            deny: [
                                PermissionFlagsBits.ViewChannel
                            ]
                        },

                        {
                            id: interaction.user.id,

                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages
                            ]
                        },

                        {
                            id: CARGO_STAFF,

                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages
                            ]
                        }

                    ]

                });

                const embed = new EmbedBuilder()

                .setTitle('📌 NOVA SOLICITAÇÃO')

                .addFields(

                    {
                        name: '👤 Nome',
                        value: nome
                    },

                    {
                        name: '🆔 ID',
                        value: id
                    }

                )

                .setColor('Red');

                const row = new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                    .setCustomId(
                        `aprovar_${interaction.user.id}`
                    )

                    .setLabel('APROVAR')

                    .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()

                    .setCustomId(
                        `reprovar_${interaction.user.id}`
                    )

                    .setLabel('REPROVAR')

                    .setStyle(ButtonStyle.Danger)

                );

                canal.send({

                    content:
                    `<@&${CARGO_STAFF}>`,

                    embeds: [embed],

                    components: [row]

                });

                return safeReply(interaction, {

                    content:
                    `✅ Solicitação enviada.`,

                    ephemeral: true

                });

            }

        }

    } catch (err) {

        console.log(err);

    }

});

// ===============================
// LOGIN
// ===============================

client.login(TOKEN);
