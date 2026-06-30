// --- 1. BANCO DE DADOS SIMULADO (MOCK DATA) ---
        // Aqui simulamos uma lista de horários e dizemos quais estão "disponíveis" (true) ou "ocupados" (false) para alguns dias.
        // Se o dia clicado não estiver nessa lista, criaremos uma regra automática para gerar horários dinamicamente!
        const agendaDona = {
            "05": { "08:00": true, "09:00": false, "10:00": true, "14:00": false, "15:00": true },
            "07": { "08:00": true, "09:00": true, "10:00": true, "11:00": true, "14:00": true, "15:00": true, "16:00": false },
            "12": { "08:00": false, "09:00": false, "10:00": false, "14:00": true, "15:00": true },
            "15": { "09:00": true, "10:00": true, "14:00": true, "15:00": false, "16:00": false, "17:00": true }
        };

        // Todos os horários de atendimento padrão do salão da Joana's Beauty
        const listaHorariosPadrao = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

        // --- 2. CAPTURA DE ELEMENTOS DO HTML (DOM) ---
        // Guardamos as caixas do HTML em variáveis para podermos manipulá-las via script
        const gridDias = document.getElementById("calendario-dias"); // Caixa onde ficam os números dos dias
        const gradeHorarios = document.getElementById("grade-horarios"); // Caixa onde vão aparecer os botões de horas
        const textoDiaSelecionado = document.getElementById("dia-selecionado-texto"); // Título que avisa qual dia foi clicado
        const inputDataOculta = document.getElementById("input-data-escolhida"); // Campo escondido que guarda a data pro envio
        const inputHorarioOculto = document.getElementById("input-horario-escolhido"); // Campo escondido que guarda a hora pro envio
        const formulario = document.getElementById("form-agendamento"); // O formulário inteiro

        // --- 3. CONFIGURAÇÃO INICIAL DO CALENDÁRIO FIXO (MAIO 2024 como exemplo visual) ---
        // Criamos uma função para desenhar os dias na tela assim que a página carregar
        function renderizarCalendarioFixo() {
            gridDias.innerHTML = ""; // Limpa qualquer conteúdo antigo de dentro do grid de dias

            // Cria os nomes dos dias da semana no topo do calendário
            const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
            diasSemana.forEach(nome => { // Loop para cada nome de dia
                const divNome = document.createElement("div"); // Cria uma caixinha div
                divNome.className = "day-name"; // Aplica a classe CSS do layout
                divNome.innerText = nome; // Coloca o texto (ex: "Dom")
                gridDias.appendChild(divNome); // Adiciona essa caixinha dentro do grid
            });

            // Adiciona os dias apagados (disabled) do mês anterior para preencher espaço (Maio começou na quarta-feira)
            const diasMundoAnterior = [28, 29, 30];
            diasMundoAnterior.forEach(num => {
                const divDiaApagado = document.createElement("div"); // Cria a div do dia
                divDiaApagado.className = "day-number disabled"; // Aplica classe cinza e bloqueada
                divDiaApagado.innerText = num; // Coloca o número
                gridDias.appendChild(divDiaApagado); // Adiciona no grid
            });

            // Loop para criar os 31 dias reais do mês de Maio
            for (let i = 1; i <= 31; i++) {
                const divDiaReal = document.createElement("div"); // Cria a div do número
                divDiaReal.className = "day-number"; // Classe padrão de dia clicável
                divDiaReal.innerText = i; // Coloca o número do dia atual do loop
                
                // Formata o número do dia com zero à esquerda se for menor que 10 (ex: 01, 02... 07) para casar com o banco de dados
                const diaFormatado = i < 10 ? "0" + i : "" + i;

                // Adiciona um evento de clique para cada dia gerado
                divDiaReal.addEventListener("click", function() {
                    // Remove a classe 'selected' de qualquer outro dia que estivesse marcado antes
                    const diaAnterior = gridDias.querySelector(".day-number.selected");
                    if (diaAnterior) { // Se achou algum dia selecionado anteriormente...
                        diaAnterior.classList.remove("selected"); // Tira a cor rosa dele
                    }

                    // Adiciona a classe 'selected' no dia exato que foi clicado agora
                    divDiaReal.classList.add("selected"); // Pinta este dia de rosa forte

                    // Atualiza o sistema chamando a função que mostra os horários daquele dia
                    atualizarSistemaHorarios(diaFormatado);
                });

                gridDias.appendChild(divDiaReal); // Insere o dia finalizado dentro do calendário na tela
            }
        }

        // --- 4. FUNÇÃO QUE FAZ APARECER OS HORÁRIOS DISPONÍVEIS ---
        // Esta função lê o dia selecionado e reconstrói a grade de horários correspondente
        function atualizarSistemaHorarios(dia) {
            gradeHorarios.innerHTML = ""; // Limpa todos os botões de horários antigos que estavam na tela
            inputHorarioOculto.value = ""; // Reseta o horário selecionado no formulário, pois trocou de dia
            
            // Atualiza os textos informativos na tela
            textoDiaSelecionado.innerText = dia + "/07/2026"; // Altera o cabeçalho de horários com o dia clicado
            inputDataOculta.value = dia + "/07/2026"; // Guarda a data no campo invisível para envio posterior

            // Verifica se este dia tem dados customizados salvos na nossa 'agendaDona'
            let horariosDoDia = agendaDona[dia];

            // Se o dia não tiver dados específicos na tabela, vamos criar uma lógica automatizada
            // para simular horários (dias pares mostram certos horários, ímpares mostram outros)
            if (!horariosDoDia) {
                horariosDoDia = {}; // Cria um objeto vazio para preenchermos agora
                listaHorariosPadrao.forEach((hora, index) => {
                    // Lógica simulada: se o número do dia somado ao índice for par, fica disponível (true), senão ocupado (false)
                    horariosDoDia[hora] = (parseInt(dia) + index) % 2 === 0;
                });
            }

            // Agora rodamos um loop na lista de horários para criar os botões na tela de fato
            listaHorariosPadrao.forEach(hora => {
                const estaDisponivel = horariosDoDia[hora]; // Pega se está true (livre) ou false (ocupado)

                const botaoHora = document.createElement("button"); // Cria o elemento <button>
                botaoHora.type = "button"; // Define como botão normal para não enviar o form antes da hora
                botaoHora.className = "time-btn"; // Classe CSS padrão de design de botão de hora
                botaoHora.innerText = hora; // Escreve o horário dentro do botão (ex: "08:00")

                if (estaDisponivel === false) { // Se o horário estiver marcado como OCUPADO
                    botaoHora.classList.add("unavailable"); // Adiciona a classe cinza de bloqueado
                } else { // Se o horário estiver DISPONÍVEL
                    // Adiciona o evento de clique para o usuário selecionar este horário específico
                    botaoHora.addEventListener("click", function() {
                        // Limpa a seleção de qualquer outro botão de hora que estivesse marcado como selecionado
                        const botaoSelecionadoAnterior = gradeHorarios.querySelector(".time-btn.selected");
                        if (botaoSelecionadoAnterior) {
                            botaoSelecionadoAnterior.classList.remove("selected"); // Tira a cor rosa preenchida
                        }

                        // Coloca a classe selected no botão clicado atual
                        botaoHora.classList.add("selected"); // Pinta o botão totalmente de rosa

                        // Salva o horário escolhido dentro do nosso campo oculto (input hidden) do formulário
                        inputHorarioOculto.value = hora; 
                    });
                }

                gradeHorarios.appendChild(botaoHora); // Coloca o botão pronto dentro da grade visual de horários
            });
        }

        // --- 5. SISTEMA DE ENVIO E VALIDAÇÃO DO FORMULÁRIO ---
        // Evento disparado quando a cliente clica em "Confirmar agendamento"
        formulario.addEventListener("submit", function(evento) {
            evento.preventDefault(); // Impede que a página recarregue antes de fazermos a nossa validação

            // Resgata os valores que estão nos inputs ocultos e nos campos de texto
            const dataFinal = inputDataOculta.value;
            const horaFinal = inputHorarioOculto.value;
            const nomeCliente = document.getElementById("nome").value;
            const servicoCliente = document.getElementById("servico").value;

            // Alerta de erro caso a cliente tenha esquecido de clicar em um dia no calendário
            if (!dataFinal) {
                alert("Por favor, selecione um dia no calendário antes de confirmar!");
                return; // Para a execução aqui e não envia
            }

            // Alerta de erro caso a cliente tenha escolhido o dia mas não clicou em nenhum botão de horário disponível
            if (!horaFinal) {
                alert("Por favor, selecione um horário disponível para o dia escolhido!");
                return; // Para a execução aqui
            }

            // Se passou pelas duas validações acima, o agendamento deu certo! Mostramos o resumo.
            alert("✨ Sucesso! Agendamento pré-confirmado com a Joana's Beauty! ✨\n\n" +
                  "Cliente: " + nomeCliente + "\n" +
                  "Serviço: " + servicoCliente + "\n" +
                  "Data: " + dataFinal + "\n" +
                  "Horário: " + horaFinal + "\n\n" +
                  "Entraremos em contato via WhatsApp para confirmar os detalhes.");
                  
            // Aqui você poderá integrar com o seu sistema de banco de dados real ou disparo de mensagens!
            formulario.reset(); // Limpa os campos do formulário para um próximo agendamento
            inputDataOculta.value = ""; // Limpa os dados internos salvos
            inputHorarioOculto.value = ""; 
            textoDiaSelecionado.innerText = "..."; // Reseta o título dinâmico
            gradeHorarios.innerHTML = "<!-- Limpo -->"; // Limpa os botões
            
            // Remove as marcações visuais de seleção do calendário
            const diaMarcado = gridDias.querySelector(".day-number.selected");
            if (diaMarcado) diaMarcado.classList.remove("selected");
        });

        // --- 6. EXECUÇÃO AO CARREGAR A PÁGINA ---
        // Deixa o calendário desenhado na tela assim que o navegador abrir o arquivo
        renderizarCalendarioFixo();
