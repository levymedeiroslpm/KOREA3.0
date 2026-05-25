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

async function fecharCanal(channel) {

    setTimeout(() => {

        channel.delete().catch(() => {});

    }, 5000);

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
            // /TABELA
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
            // PARCERIA
            // =======================

            if (interaction.customId === 'abrir_parceria') {

                const modal = new ModalBuilder()

                .setCustomId('modal_parceria')

                .setTitle('Enviar Parceria');

                modal.addComponents(

                    new ActionRowBuilder().addComponents(

                        new TextInputBuilder()

                        .setCustomId('localizacao')

                        .setLabel('Localização')

                        .setStyle(TextInputStyle.Short)

                        .setRequired(true)

                    ),

                    new ActionRowBuilder().addComponents(

                        new TextInputBuilder()

                        .setCustomId('familia')

                        .setLabel('Nome da família')

                        .setStyle(TextInputStyle.Short)

                        .setRequired(true)

                    ),

                    new ActionRowBuilder().addComponents(

                        new TextInputBuilder()

                        .setCustomId('faz')

                        .setLabel('O que faz?')

                        .setStyle(TextInputStyle.Paragraph)

                        .setRequired(true)

                    ),

                    new ActionRowBuilder().addComponents(

                        new TextInputBuilder()

                        .setCustomId('telefone')

                        .setLabel('Telefone')

                        .setStyle(TextInputStyle.Short)

                        .setRequired(true)

                    ),

                    new ActionRowBuilder().addComponents(

                        new TextInputBuilder()

                        .setCustomId('foto')

                        .setLabel('Link da foto')

                        .setStyle(TextInputStyle.Short)

                        .setRequired(true)

                    )

                );

                return interaction.showModal(modal);

            }

            // =======================
            // APROVAR SET
            // =======================

            if (interaction.customId.startsWith('aprovar_')) {

                const userId =
                interaction.customId.split('_')[1];

                const membro =
                await interaction.guild.members.fetch(userId);

                await membro.roles.remove(CARGO_SEM_CARGO);

                await membro.roles.add(CARGO_MEMBRO);

                await interaction.reply({

                    content:
                    `✅ ${membro} aprovado.`

                });

                fecharCanal(interaction.channel);

            }

            // =======================
            // REPROVAR SET
            // =======================

            if (interaction.customId.startsWith('reprovar_')) {

                await interaction.reply({

                    content:
                    `❌ Solicitação recusada.`

                });

                fecharCanal(interaction.channel);

            }

        }

        // ===========================
        // MODAIS
        // ===========================

        if (interaction.isModalSubmit()) {

            // =======================
            // MODAL PARCERIA
            // =======================

            if (interaction.customId === 'modal_parceria') {

                const localizacao =
                interaction.fields.getTextInputValue('localizacao');

                const familia =
                interaction.fields.getTextInputValue('familia');

                const faz =
                interaction.fields.getTextInputValue('faz');

                const telefone =
                interaction.fields.getTextInputValue('telefone');

                const foto =
                interaction.fields.getTextInputValue('foto');

                const canal =
                interaction.guild.channels.cache.get(
                    CANAL_PARCERIA
                );

                const embed = new EmbedBuilder()

                .setTitle('🤝 NOVA PARCERIA')

                .addFields(

                    {
                        name: '📍 Localização',
                        value: localizacao
                    },

                    {
                        name: '👥 Família',
                        value: familia
                    },

                    {
                        name: '💼 O que faz',
                        value: faz
                    },

                    {
                        name: '☎️ Contato',
                        value: telefone
                    }

                )

                .setImage(foto)

                .setColor('DarkRed')

                .setTimestamp();

                canal.send({
                    embeds: [embed]
                });

                return interaction.reply({

                    content:
                    '✅ Parceria enviada.',

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
