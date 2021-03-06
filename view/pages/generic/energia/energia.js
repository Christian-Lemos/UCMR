let $ = require('jquery')
let utils = require('../../generic/utils')
let observer = require('../../generic/observer')
let Chart = require('chart.js')
let chart;
let logSolar;
let color = Chart.helpers.color;
require('chartjs-plugin-zoom')
let timeFormat = 'DD-MM-YYYY hh:mm:ss';

function tipoToString(tipo)
{
	tipo = Number(tipo);
	let tipoString;
	switch (tipo)
	{
		case 0:
			tipoString = "Debug";
			break;
		case 1:
			tipoString = "Fronius";
			break;
		default:
			tipoString = "Desconhecido";
	}
	return tipoString;
}

function estadoToString(estado)
{
	let string;
	if (estado)
	{
		string = "<b><span class = 'text-success'>Sucesso</span></b>";
	}
	else
	{
		string = "<b><span class = 'text-danger'>Falha</span></b>";
	}
	return string;
}

function AtualizarTabelaPainel(data)
{
	let linha = $("#tbody-paineis tr[data-id='" + data._id + "']");
	$(".lista-nome", linha).html(data.nome)
	$(".lista-caminho", linha).html(data.path)
	$(".lista-host", linha).html(data.host)

	$(".lista-tipo", linha).html(tipoToString(data.tipo))
	$(".lista-tipo", linha).data('tipo', data.tipo);
	$(".lista-tipo", linha).attr('data-tipo', data.tipo);
}

function AtualizarTabelaPainelEstado(id, estado)
{
	let linha = $("#tbody-paineis tr[data-id='" + id + "']");
	$(".lista-estado", linha).html(estadoToString(estado));
}

function AdicionarTabelaPainel(data)
{
	let tipoString = tipoToString(data.tipo);
	let estadoString = estadoToString(data.estado);
	let htmlString = '<tr data-id="' + data._id + '" class = "lista-id"><td class = "lista-nome">' + data.nome + '</td><td class = "lista-tipo" data-tipo="' + data.tipo + '">' + tipoString + '</td><td  class = "lista-estado">' + estadoString + '</td><td class = "lista-host">' + data.host + '</td><td class = "lista-caminho">' + data.path + '</td><td><button type = "button" class = "btn btn-primary btn-editar-painel" title = "Editar"><i class = "fa fa-edit"></i></button><button type = "button" class = "btn btn-danger btn-excluir-painel" title = "Excluir"><i class = "fa fa-times-circle"></i></button></td></tr>';
	$("#tbody-paineis").append(htmlString);
}

function RemoverTabelaPainel(id)
{
	$("#tbody-paineis tr[data-id='" + id + "']").remove();
}

function RemoverPainelGrafico(id)
{
	let i;
	let encontrado = false;
	for (i = 0; i < chart.data.datasets.length; i++)
	{
		if (chart.data.datasets[i]._id == id)
		{
			encontrado = true;
			break;
		}

	}
	if (encontrado)
	{
		chart.data.datasets.splice(i, 1);
	}

	chart.update();
}

function AdicionarPainelGrafico(painel)
{
	let cor = getRandomColor();
	chart.data.datasets.push(
	{
		_id: painel._id,
		label: painel.nome,
		backgroundColor: cor,
		borderColor: cor,
		lineTension: 0,
		fill: false,

		data: []
	});
	chart.update();
}

function AtualizarNomePainelGrafico(painel)
{
	for (let i = 0; i < chart.data.datasets.length; i++)
	{
		if (chart.data.datasets[i]._id == painel._id)
		{
			chart.data.datasets[i].label = painel.nome;
			chart.update();
			return;
		}

	}


}
$(document).ready(function ()
{
	GetLogSolar();
	$("#form-adicionar-painel").on('submit', function ()
	{
		let data = $(this).serialize();
		$.ajax(
		{
			url: '/comandos/painel/adicionar',
			method: 'POST',
			data: data,
			dataType: 'JSON',
			success: function (resposta)
			{
				utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
			},
			error: function ()
			{
				utils.GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
			}

		});
	});
	$("#form-editar-painel").on('submit', function ()
	{
		let dataArray = $(this).serializeArray();
		let data = $.param(dataArray);
		let dataAssocArray = {};
		for (let i = 0; i < dataArray.length; i++)
		{
			dataAssocArray[dataArray[i].name] = dataArray[i].value;
		}
		dataAssocArray['_id'] = dataAssocArray.id;
		$.ajax(
		{
			url: '/comandos/painel/editar',
			method: 'POST',
			data: data,
			dataType: 'JSON',
			success: function (resposta)
			{
				utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
			},
			error: function ()
			{
				utils.GerarNotificacao("Houve um erro na aplicação. Tente novamente mais tarde.", "danger");
			}

		});
	});
	$("#tbody-paineis").on('click', ".btn-excluir-painel", function ()
	{
		let linha = $(this).parent().parent();

		let enviarExcluir = function ()
		{
			let codigo = linha.data('id');
			$.ajax(
			{
				url: '/comandos/painel/excluir',
				method: 'POST',
				data:
				{
					id: codigo
				},
				dataType: 'JSON',
				success: function (resposta)
				{
					utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);
				},
				error: function ()
				{
					utils.GerarNotificacao("Houve um erro na aplicação.", "danger");
				}
			});
		};

		utils.GerarConfirmacao("Tens certeza que queres excluir painel <i>" + linha.find("td").first().html() + "</i> ?", enviarExcluir);

	});
	$("#tbody-paineis").on('click', ".btn-editar-painel", function ()
	{
		let linha = $(this).parent().parent();
		let nome = $(".lista-nome", linha);
		let caminho = $(".lista-caminho", linha);
		let tipo = $(".lista-host", linha);

		$("#editar-id").val(linha.data("id"));
		$("#editar-nome").val(nome.text());
		$("#editar-caminho").val(caminho.text());
		$("#editar-host").val(tipo.text());
		$("#editar-tipo").val($(".lista-tipo", linha).data("tipo"));

		$("#modal-editar-painel").modal('show');
	});

	$("#btn-reset-zoom-grafico").on('click', function ()
	{
		chart.resetZoom();
	});
	$("#btn-excluir-dados-grafico").on('click', function ()
	{
		let excluir = function ()
		{
			$.ajax(
			{
				url: '/comandos/painel/excluirlog',
				method: 'GET',
				dataType: 'JSON',
				success: function (resposta)
				{
					utils.GerarNotificacao(resposta.mensagem.conteudo, resposta.mensagem.tipo);

					chart.data.datasets.forEach((dataset) =>
					{
						dataset.data = [];
					});
					chart.update();

				},
				error: function ()
				{
					utils.GerarNotificacao("Houve um erro na aplicação.", "danger");
				}
			})
		}

		utils.GerarConfirmacao("Tens certeza que desejas excluir todos os dados de produção de energia coletados?", excluir);
		

	});
})


function getRandomColor()
{
	let letters = '0123456789ABCDEF'.split('');
	let color = '#';
	for (let i = 0; i < 6; i++)
	{
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}


function GetLogSolar()
{
	$.ajax(
	{
		url: '/comandos/painel/getlogsolar',
		method: 'GET',
		dataType: 'JSON',
		success: function (resposta)
		{
			logSolar = resposta.logSolar;
			for (let i = 0; i < logSolar.length; i++)
			{
				AdicionarTabelaPainel(logSolar[i]);
			}
			let dataSets = new Array();
			for (let i = 0; i < logSolar.length; i++)
			{

                let thisdataset = new Array();
                let j = 0;
				for (; j < logSolar[i].logs.length; j++)
				{
					let tempo = new Date(logSolar[i].logs[j].tempo);
					thisdataset.push(
					{
						x: utils.FormatarDate(tempo, "-"),
						y: logSolar[i].logs[j].valor
					});
				}
				let cor = getRandomColor();
				dataSets.push(
				{
					_id: logSolar[i]._id,
					label: logSolar[i].nome,
					backgroundColor: cor,
					borderColor: cor,
					lineTension: 0,
					fill: false,

					data: thisdataset
				});
			}

			let config = {
				type: 'line',
				data:
				{
					datasets: dataSets
				},
				options:
				{
					title:
					{
						text: 'Chart.js Time Scale'
					},

					scales:
					{
						xAxes: [
						{
							type: 'time',
							time:
							{
								parser: timeFormat,
								tooltipFormat: 'll HH:mm'
							},
							scaleLabel:
							{
								display: true,
								labelString: 'Horário'
							}
						}],
						yAxes: [
						{
							scaleLabel:
							{
								display: true,
								labelString: 'Produção em W'
							}
						}]
					},
					pan:
					{
						enabled: true,
						mode: 'xy'
					},

					zoom:
					{
						enabled: true,
						drag: false,
						mode: 'xy',
					}
				}
			};

			let ctx = document.getElementById('canvas').getContext('2d');
			chart = new Chart(ctx, config);
		},
		error: function ()
		{
			utils.GerarNotificacao("Houve um erro na aplicação.", "danger");
		}
	});
}






observer.Observar('socket-ready', function (socket)
{
	socket.on('att painel', function (mensagem)
	{
		utils.LimparObj(mensagem);
		AtualizarTabelaPainel(mensagem);
		AtualizarNomePainelGrafico(mensagem);
	});
	socket.on('add painel', function (mensagem)
	{
		utils.LimparObj(mensagem);
		AdicionarTabelaPainel(mensagem);
		AdicionarPainelGrafico(mensagem);
	});
	socket.on('rem painel', function (mensagem)
	{
		RemoverTabelaPainel(mensagem);
		RemoverPainelGrafico(mensagem);
	});
	socket.on('att grafico energia', function (mensagem)
	{
		utils.LimparObj(mensagem);
		let tempo = new Date(mensagem.tempo);
		chart.data.datasets.forEach((dataset) =>
		{
			if (dataset._id == mensagem.id)
			{
				let data = {
					x: utils.FormatarDate(tempo, "-"),
					y: mensagem.valor
				};
				dataset.data.push(data);
			}

		});
		chart.update();
	});
	socket.on('att painel estado', function (mensagem)
	{
		utils.LimparObj(mensagem);
		AtualizarTabelaPainelEstado(mensagem.id, mensagem.estado)
	});

})