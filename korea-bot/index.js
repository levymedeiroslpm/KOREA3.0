require('dotenv').config();

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
// CONFIG
// ===============================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID || '1507961405545119814';
const GUILD_ID = process.env.GUILD_ID || '1505576877505646702';

const CARGO_STAFF = process.env.CARGO_STAFF || '1505576877505646711';
const CARGO_SEM_CARGO = process.env.CARGO_SEM_CARGO || '1505576877505646703';
const CARGO_MEMBRO = process.env.CARGO_MEMBRO || '1505576877505646707';

const CANAL_PARCERIA = process.env.CANAL_PARCERIA || '';
const CANAL_LOGS = process.env.CANAL_LOGS || '';
const CANAL_ENTRADA_SAIDA = process.env.CANAL_ENTRADA_SAIDA || '';
const CANAL_SUGESTOES = process.env.CANAL_SUGESTOES || '';
const CANAL_PUNICOES = process.env.CANAL_PUNICOES || '';
const CANAL_AUSENCIA = process.env.CANAL_AUSENCIA || '';
const CANAL_BAU_LOG = process.env.CANAL_BAU_LOG || '';
const CANAL_VENDAS = process.env.CANAL_VENDAS || '';
const CANAL_METAS = process.env.CANAL_METAS || '';
const CATEGORIA_TICKETS = process.env.CATEGORIA_TICKETS || '';

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

async function sendLog(guild, title, description, color = 'DarkRed') {
    try {
        if (!CANAL_LOGS) return;
        const channel = guild.channels.cache.get(CANAL_LOGS);
        if (!channel) return;

        await channel.send({
            embeds: [makeEmbed(title, description, color)]
        });
    } catch (err) {
        console.log('Erro ao enviar log:', err.message);
    }
}

async function safeReply(interaction, options) {
    try {
        if (interaction.replied || interaction.deferred) {
            return interaction.followUp(options);
        }
        return interaction.reply(options);
    } catch (err) {
        console.log('Erro ao responder interação:', err.message);
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
        .setDescription('Enviar painel de solicitação de set'),

    new SlashCommandBuilder()
        .setName('suporte')
        .setDescription('Enviar painel de suporte'),

    new SlashCommandBuilder()
        .setName('parceria')
        .setDescription('Enviar parceria')
        .addStringOption(option =>
            option.setName('localizacao')
                .setDescription('Localização da família/fac parceira')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('familia')
                .setDescription('Nome da família/fac parceira')
                .setRequired(true)
        )
        .addAttachmentOption(option =>
            option.setName('foto')
                .setDescription('Foto da roupa ou identidade da parceria')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('punir')
        .setDescription('Registrar punição')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário punido')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo da punição')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('punicao')
                .setDescription('Tipo de punição')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('ausencia')
        .setDescription('Registrar ausência')
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo da ausência')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('retorno')
                .setDescription('Data ou previsão de retorno')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('sugestao')
        .setDescription('Enviar sugestão')
        .addStringOption(option =>
            option.setName('texto')
                .setDescription('Sua sugestão')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('bau')
        .setDescription('Registrar movimentação no baú')
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('colocou ou retirou')
                .setRequired(true)
                .addChoices(
                    { name: 'Colocou', value: 'colocou' },
                    { name: 'Retirou', value: 'retirou' }
                )
        )
        .addStringOption(option =>
            option.setName('item')
                .setDescription('Item movimentado')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('quantidade')
                .setDescription('Quantidade')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('venda')
        .setDescription('Registrar venda ou encomenda')
        .addStringOption(option =>
            option.setName('produto')
                .setDescription('Produto vendido/encomendado')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('valor')
                .setDescription('Valor')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('cliente')
                .setDescription('Cliente/comprador')
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('meta')
        .setDescription('Registrar meta/farm/pagamento')
        .addStringOption(option =>
            option.setName('descricao')
                .setDescription('Descrição da meta')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('valor')
                .setDescription('Valor/quantidade')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('fechar')
        .setDescription('Fechar o ticket atual')
];

// ===============================
// REGISTRAR COMANDOS
// ===============================

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function registerCommands() {
    try {
        console.log('Registrando comandos...');
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands.map(cmd => cmd.toJSON()) }
        );
        console.log('Comandos registrados.');
    } catch (error) {
        console.log('Erro ao registrar comandos:', error);
    }
}

// ===============================
// READY
// ===============================

client.once(Events.ClientReady, async () => {
    console.log(`Bot online: ${client.user.tag}`);
});

// ===============================
// MEMBRO ENTROU / SAIU
// ===============================

client.on(Events.GuildMemberAdd, async member => {
    try {
        await member.roles.add(CARGO_SEM_CARGO);

        const embed = makeEmbed(
            '🚪 Novo membro',
            `${member} entrou no servidor e recebeu o cargo **SEM CARGO**.`,
            'Green'
        );

        if (CANAL_ENTRADA_SAIDA) {
            const canal = member.guild.channels.cache.get(CANAL_ENTRADA_SAIDA);
            if (canal) await canal.send({ embeds: [embed] });
        }

        await sendLog(member.guild, '✅ Cargo automático', `${member} recebeu <@&${CARGO_SEM_CARGO}>.`, 'Green');
        console.log(`${member.user.tag} recebeu SEM CARGO`);

    } catch (err) {
        console.log('Erro ao dar SEM CARGO:', err.message);
        await sendLog(member.guild, '❌ Erro ao dar cargo', `Não consegui dar SEM CARGO para ${member}.\nErro: ${err.message}`, 'Red');
    }
});

client.on(Events.GuildMemberRemove, async member => {
    try {
        if (!CANAL_ENTRADA_SAIDA) return;
        const canal = member.guild.channels.cache.get(CANAL_ENTRADA_SAIDA);
        if (!canal) return;

        await canal.send({
            embeds: [
                makeEmbed('🚪 Membro saiu', `**${member.user.tag}** saiu do servidor.`, 'Red')
            ]
        });
    } catch (err) {
        console.log('Erro saída:', err.message);
    }
});

// ===============================
// INTERAÇÕES
// ===============================

client.on(Events.InteractionCreate, async interaction => {

    try {

        // ===============================
        // SLASH COMMANDS
        // ===============================

        if (interaction.isChatInputCommand()) {

            // /set
            if (interaction.commandName === 'set') {
                if (!onlyStaff(interaction)) {
                    return safeReply(interaction, {
                        content: '❌ Apenas staff pode usar esse comando.',
                        ephemeral: true
                    });
                }

                const embed = makeEmbed(
                    '📌 SOLICITAR SET',
                    'Bem-vindo à fac.\n\nClique no botão abaixo e preencha:\n\n👤 **Nome no jogo**\n🆔 **ID do jogo**\n\nA staff vai conferir e liberar seu acesso.',
                    'DarkRed'
                );

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('abrir_set')
                        .setLabel('SOLICITAR SET')
                        .setStyle(ButtonStyle.Danger)
                );

                await interaction.channel.send({ embeds: [embed], components: [row] });

                return safeReply(interaction, {
                    content: '✅ Painel de set enviado.',
                    ephemeral: true
                });
            }

            // /suporte
            if (interaction.commandName === 'suporte') {
                if (!onlyStaff(interaction)) {
                    return safeReply(interaction, {
                        content: '❌ Apenas staff pode usar esse comando.',
                        ephemeral: true
                    });
                }

                const embed = makeEmbed(
                    '📣 SUPORTE',
                    'Precisa de ajuda? Clique no botão abaixo para abrir um ticket com a staff.',
                    'DarkRed'
                );

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('abrir_suporte')
                        .setLabel('ABRIR SUPORTE')
                        .setStyle(ButtonStyle.Primary)
                );

                await interaction.channel.send({ embeds: [embed], components: [row] });

                return safeReply(interaction, {
                    content: '✅ Painel de suporte enviado.',
                    ephemeral: true
                });
            }

            // /parceria
            if (interaction.commandName === 'parceria') {
                const localizacao = interaction.options.getString('localizacao');
                const familia = interaction.options.getString('familia');
                const foto = interaction.options.getAttachment('foto');

                const canal = CANAL_PARCERIA ? interaction.guild.channels.cache.get(CANAL_PARCERIA) : interaction.channel;

                if (!canal) {
                    return safeReply(interaction, {
                        content: '❌ Canal de parceria não encontrado.',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setTitle('🤝 NOVA PARCERIA')
                    .addFields(
                        { name: '📍 Localização', value: localizacao },
                        { name: '👥 Família', value: familia },
                        { name: '👤 Enviado por', value: `${interaction.user}` }
                    )
                    .setImage(foto.url)
                    .setColor('DarkRed')
                    .setTimestamp();

                await canal.send({ embeds: [embed] });

                await sendLog(interaction.guild, '🤝 Parceria enviada', `${interaction.user} enviou parceria: **${familia}**.`, 'Green');

                return safeReply(interaction, {
                    content: '✅ Parceria enviada.',
                    ephemeral: true
                });
            }

            // /punir
            if (interaction.commandName === 'punir') {
                if (!onlyStaff(interaction)) {
                    return safeReply(interaction, {
                        content: '❌ Apenas staff pode usar esse comando.',
                        ephemeral: true
                    });
                }

                const usuario = interaction.options.getUser('usuario');
                const motivo = interaction.options.getString('motivo');
                const punicao = interaction.options.getString('punicao');

                const embed = makeEmbed(
                    '🔴 PUNIÇÃO REGISTRADA',
                    `👤 **Usuário:** ${usuario}\n🧾 **Punição:** ${punicao}\n📌 **Motivo:** ${motivo}\n👮 **Staff:** ${interaction.user}`,
                    'Red'
                );

                const canal = CANAL_PUNICOES ? interaction.guild.channels.cache.get(CANAL_PUNICOES) : interaction.channel;
                if (canal) await canal.send({ embeds: [embed] });

                await sendLog(interaction.guild, '🔴 Punição', `${usuario} recebeu punição: **${punicao}**.\nMotivo: ${motivo}`, 'Red');

                return safeReply(interaction, {
                    content: '✅ Punição registrada.',
                    ephemeral: true
                });
            }

            // /ausencia
            if (interaction.commandName === 'ausencia') {
                const motivo = interaction.options.getString('motivo');
                const retorno = interaction.options.getString('retorno');

                const embed = makeEmbed(
                    '💤 AUSÊNCIA REGISTRADA',
                    `👤 **Membro:** ${interaction.user}\n📌 **Motivo:** ${motivo}\n📅 **Retorno previsto:** ${retorno}`,
                    'Yellow'
                );

                const canal = CANAL_AUSENCIA ? interaction.guild.channels.cache.get(CANAL_AUSENCIA) : interaction.channel;
                if (canal) await canal.send({ embeds: [embed] });

                return safeReply(interaction, {
                    content: '✅ Ausência registrada.',
                    ephemeral: true
                });
            }

            // /sugestao
            if (interaction.commandName === 'sugestao') {
                const texto = interaction.options.getString('texto');

                const embed = makeEmbed(
                    '🎯 NOVA SUGESTÃO',
                    `👤 **Autor:** ${interaction.user}\n\n💡 **Sugestão:**\n${texto}`,
                    'Blue'
                );

                const canal = CANAL_SUGESTOES ? interaction.guild.channels.cache.get(CANAL_SUGESTOES) : interaction.channel;
                const msg = await canal.send({ embeds: [embed] });

                await msg.react('✅');
                await msg.react('❌');

                return safeReply(interaction, {
                    content: '✅ Sugestão enviada.',
                    ephemeral: true
                });
            }

            // /bau
            if (interaction.commandName === 'bau') {
                const tipo = interaction.options.getString('tipo');
                const item = interaction.options.getString('item');
                const quantidade = interaction.options.getString('quantidade');

                const icon = tipo === 'colocou' ? '📥' : '📤';
                const color = tipo === 'colocou' ? 'Green' : 'Orange';

                const embed = makeEmbed(
                    `${icon} CONTROLE DE BAÚ`,
                    `👤 **Membro:** ${interaction.user}\n📦 **Item:** ${item}\n🔢 **Quantidade:** ${quantidade}\n📌 **Tipo:** ${tipo}`,
                    color
                );

                const canal = CANAL_BAU_LOG ? interaction.guild.channels.cache.get(CANAL_BAU_LOG) : interaction.channel;
                if (canal) await canal.send({ embeds: [embed] });

                return safeReply(interaction, {
                    content: '✅ Registro de baú enviado.',
                    ephemeral: true
                });
            }

            // /venda
            if (interaction.commandName === 'venda') {
                const produto = interaction.options.getString('produto');
                const valor = interaction.options.getString('valor');
                const clienteNome = interaction.options.getString('cliente') || 'Não informado';

                const embed = makeEmbed(
                    '💸 VENDA / ENCOMENDA',
                    `👤 **Vendedor:** ${interaction.user}\n🛒 **Produto:** ${produto}\n💰 **Valor:** ${valor}\n🤝 **Cliente:** ${clienteNome}`,
                    'Green'
                );

                const canal = CANAL_VENDAS ? interaction.guild.channels.cache.get(CANAL_VENDAS) : interaction.channel;
                if (canal) await canal.send({ embeds: [embed] });

                return safeReply(interaction, {
                    content: '✅ Venda registrada.',
                    ephemeral: true
                });
            }

            // /meta
            if (interaction.commandName === 'meta') {
                const descricao = interaction.options.getString('descricao');
                const valor = interaction.options.getString('valor');

                const embed = makeEmbed(
                    '🍀 META REGISTRADA',
                    `👤 **Membro:** ${interaction.user}\n📌 **Descrição:** ${descricao}\n📊 **Valor/Quantidade:** ${valor}`,
                    'Green'
                );

                const canal = CANAL_METAS ? interaction.guild.channels.cache.get(CANAL_METAS) : interaction.channel;
                if (canal) await canal.send({ embeds: [embed] });

                return safeReply(interaction, {
                    content: '✅ Meta registrada.',
                    ephemeral: true
                });
            }

            // /fechar
            if (interaction.commandName === 'fechar') {
                if (!interaction.channel.name.startsWith('set-') && !interaction.channel.name.startsWith('suporte-')) {
                    return safeReply(interaction, {
                        content: '❌ Esse comando só funciona em ticket.',
                        ephemeral: true
                    });
                }

                await safeReply(interaction, {
                    content: '🔒 Ticket será fechado.',
                    ephemeral: true
                });

                setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
                return;
            }
        }

        // ===============================
        // BOTÕES
        // ===============================

        if (interaction.isButton()) {

            // Abrir SET
            if (interaction.customId === 'abrir_set') {
                const modal = new ModalBuilder()
                    .setCustomId('modal_set')
                    .setTitle('Solicitação de Set');

                const nomeInput = new TextInputBuilder()
                    .setCustomId('nome_jogo')
                    .setLabel('Nome no jogo')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const idInput = new TextInputBuilder()
                    .setCustomId('id_jogo')
                    .setLabel('ID do jogo')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(nomeInput),
                    new ActionRowBuilder().addComponents(idInput)
                );

                return interaction.showModal(modal);
            }

            // Abrir suporte
            if (interaction.customId === 'abrir_suporte') {
                const canal = await interaction.guild.channels.create({
                    name: `suporte-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                    type: ChannelType.GuildText,
                    parent: CATEGORIA_TICKETS || null,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        },
                        {
                            id: CARGO_STAFF,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        }
                    ]
                });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('fechar_ticket')
                        .setLabel('FECHAR')
                        .setStyle(ButtonStyle.Secondary)
                );

                await canal.send({
                    content: `<@&${CARGO_STAFF}> ${interaction.user}`,
                    embeds: [
                        makeEmbed(
                            '📣 SUPORTE ABERTO',
                            `Usuário: ${interaction.user}\n\nExplique seu problema para a staff.`,
                            'Blue'
                        )
                    ],
                    components: [row]
                });

                return safeReply(interaction, {
                    content: `✅ Ticket criado: ${canal}`,
                    ephemeral: true
                });
            }

            // Aprovar set
            if (interaction.customId.startsWith('aprovar_set_')) {
                if (!onlyStaff(interaction)) {
                    return safeReply(interaction, {
                        content: '❌ Apenas staff pode aprovar.',
                        ephemeral: true
                    });
                }

                const userId = interaction.customId.split('_')[2];
                const membro = await interaction.guild.members.fetch(userId);

                await membro.roles.remove(CARGO_SEM_CARGO).catch(() => {});
                await membro.roles.add(CARGO_MEMBRO);

                await interaction.update({
                    content: `✅ ${membro} foi aprovado por ${interaction.user}.`,
                    components: []
                });

                await membro.send('✅ Você foi aprovado na setagem e seu acesso foi liberado.').catch(() => {});
                await sendLog(interaction.guild, '✅ Set aprovado', `${membro} foi aprovado por ${interaction.user}.`, 'Green');

                return;
            }

            // Reprovar set
            if (interaction.customId.startsWith('reprovar_set_')) {
                if (!onlyStaff(interaction)) {
                    return safeReply(interaction, {
                        content: '❌ Apenas staff pode reprovar.',
                        ephemeral: true
                    });
                }

                const userId = interaction.customId.split('_')[2];
                const membro = await interaction.guild.members.fetch(userId).catch(() => null);

                await interaction.update({
                    content: `❌ Solicitação reprovada por ${interaction.user}.`,
                    components: []
                });

                if (membro) {
                    await membro.send('❌ Sua solicitação de set foi reprovada. Procure a staff para mais informações.').catch(() => {});
                    await sendLog(interaction.guild, '❌ Set reprovado', `${membro} foi reprovado por ${interaction.user}.`, 'Red');
                }

                return;
            }

            // Fechar ticket botão
            if (interaction.customId === 'fechar_ticket') {
                if (!onlyStaff(interaction)) {
                    return safeReply(interaction, {
                        content: '❌ Apenas staff pode fechar ticket.',
                        ephemeral: true
                    });
                }

                await safeReply(interaction, {
                    content: '🔒 Ticket será fechado em 2 segundos.',
                    ephemeral: true
                });

                setTimeout(() => interaction.channel.delete().catch(() => {}), 2000);
                return;
            }
        }

        // ===============================
        // MODAL SET
        // ===============================

        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'modal_set') {
                const nome = interaction.fields.getTextInputValue('nome_jogo');
                const id = interaction.fields.getTextInputValue('id_jogo');

                const canal = await interaction.guild.channels.create({
                    name: `set-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                    type: ChannelType.GuildText,
                    parent: CATEGORIA_TICKETS || null,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        },
                        {
                            id: interaction.user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        },
                        {
                            id: CARGO_STAFF,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory
                            ]
                        }
                    ]
                });

                const embed = new EmbedBuilder()
                    .setTitle('📌 NOVA SOLICITAÇÃO DE SET')
                    .addFields(
                        { name: '👤 Discord', value: `${interaction.user}` },
                        { name: '🎮 Nome no jogo', value: nome },
                        { name: '🆔 ID do jogo', value: id }
                    )
                    .setColor('Red')
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`aprovar_set_${interaction.user.id}`)
                        .setLabel('APROVAR')
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId(`reprovar_set_${interaction.user.id}`)
                        .setLabel('REPROVAR')
                        .setStyle(ButtonStyle.Danger),

                    new ButtonBuilder()
                        .setCustomId('fechar_ticket')
                        .setLabel('FECHAR')
                        .setStyle(ButtonStyle.Secondary)
                );

                await canal.send({
                    content: `<@&${CARGO_STAFF}> ${interaction.user}`,
                    embeds: [embed],
                    components: [row]
                });

                await safeReply(interaction, {
                    content: `✅ Solicitação enviada para staff: ${canal}`,
                    ephemeral: true
                });

                await sendLog(interaction.guild, '📌 Nova solicitação de set', `${interaction.user} enviou solicitação.\nNome: ${nome}\nID: ${id}`, 'Yellow');
            }
        }

    } catch (err) {
        console.log('Erro na interação:', err);
        await safeReply(interaction, {
            content: `❌ Deu erro: ${err.message}`,
            ephemeral: true
        });
    }

});

// ===============================
// LOGIN
// ===============================

if (!TOKEN) {
    console.log('ERRO: TOKEN não encontrado. Configure a variável TOKEN no Render.');
    process.exit(1);
}

registerCommands().then(() => {
    client.login(TOKEN);
});
