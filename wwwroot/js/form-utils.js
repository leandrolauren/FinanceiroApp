$(document).ready(function () {
  // Máscaras e placeholders para pessoa física
  if ($('#Nome').length) $('#Nome').attr('placeholder', 'Nome completo')
  if ($('#Cpf').length) {
    $('#Cpf').mask('000.000.000-00', { placeholder: '___.___.___-__' })
    $('#Cpf').attr('placeholder', '___.___.___-__')
  }
  if ($('#Rg').length) {
    $('#Rg').mask('00.000.000-0', { placeholder: '__.___.___-_' })
    $('#Rg').attr('placeholder', '__.___.___-_')
  }
  if ($('#DataNascimento').length)
    $('#DataNascimento').attr('placeholder', 'Data de nascimento')

  // Máscaras e placeholders para pessoa jurídica
  if ($('#Cnpj').length) {
    $('#Cnpj').mask('00.000.000/0000-00', { placeholder: '__.___.___/____-__' })
    $('#Cnpj').attr('placeholder', '__.___.___/____-__')
  }
  if ($('#RazaoSocial').length)
    $('#RazaoSocial').attr('placeholder', 'Razão Social')
  if ($('#NomeFantasia').length)
    $('#NomeFantasia').attr('placeholder', 'Nome Fantasia')
  if ($('#InscricaoEstadual').length)
    $('#InscricaoEstadual').attr('placeholder', 'Inscrição Estadual')

  // Máscaras e placeholders para contato/endereço
  if ($('#Telefone').length) {
    $('#Telefone').mask('(00) 00000-0000', { placeholder: '(__) _____-____' })
    $('#Telefone').attr('placeholder', '(__) _____-____')
  }
  if ($('#Email').length) $('#Email').attr('placeholder', 'E-mail')
  if ($('#Cep').length) {
    $('#Cep').mask('00000-000', { placeholder: '_____-___' })
    $('#Cep').attr('placeholder', '_____-___')
  }
  if ($('#Endereco').length) $('#Endereco').attr('placeholder', 'Rua')
  if ($('#Numero').length) $('#Numero').attr('placeholder', 'Número')
  if ($('#Bairro').length) $('#Bairro').attr('placeholder', 'Bairro')
  if ($('#Cidade').length) $('#Cidade').attr('placeholder', 'Cidade')
  if ($('#Estado').length) $('#Estado').attr('placeholder', 'Estado')
  if ($('#Complemento').length)
    $('#Complemento').attr('placeholder', 'Complemento')

  // Placeholder para Plano de Contas
  if ($('#PlanoContas').length)
    $('#PlanoContas').attr('placeholder', 'Plano Contas')

  // Máscaras e placeholder para Contas Bancárias
  if ($('#DescricaoConta').length)
    $('#DescricaoConta').attr('placeholder', 'Descrição')
  if ($('#NumeroConta').length)
    $('#NumeroConta').attr('placeholder', 'Número da Conta')
  if ($('#DigitoConta').length)
    $('#DigitoConta').attr('placeholder', 'Dígito Verificador')
  if ($('#Agencia').length)
    $('#Agencia').attr('placeholder', 'Número da Agência')
  if ($('#DigitoAgencia').length)
    $('#DigitoAgencia').attr('placeholder', 'DV Agência')
  if ($('#Banco').length) $('#Banco').attr('placeholder', 'Nome do Banco')

  // Mascara de dinheiro para o campo Valor
  if ($('#Valor').length) {
    $('#Valor').mask('000.000.000,00', { reverse: true })
    $('#Valor').attr('placeholder', '0,00')
    // Corrige bug do input sumir ao digitar rápido
    $('#Valor').on('input', function () {
      var val = $(this).val()
      if (val === '') $(this).val('')
    })
  }

  // Inicializa Select2 em todos os selects com .select2
  if ($('.select2').length) {
    $('.select2').select2({
      width: '100%',
      language: 'pt-BR',
      placeholder: 'Selecione...',
      allowClear: true,
    })
  }

  // Busca de CEP
  let cepTimeout = null
  $('#Cep').on('input', function () {
    clearTimeout(cepTimeout)
    const cep = $(this).val().replace(/\D/g, '')
    if (cep.length === 8) {
      cepTimeout = setTimeout(function () {
        $.get(`https://brasilapi.com.br/api/cep/v2/${cep}`)
          .done(function (data) {
            $('#Endereco').val(data.street || '')
            $('#Bairro').val(data.neighborhood || '')
            $('#Cidade').val(data.city || '')
            $('#Estado').val(data.state || '')
            $('#Complemento').val(data.complement || '')
            if ($('#Endereco').val() === '') $('#Endereco').focus()
          })
          .fail(function () {
            alert('Erro ao consultar CEP.')
          })
      }, 800)
    }
  })

  // Busca de CNPJ
  let cnpjTimeout = null
  $('#Cnpj').on('input', function () {
    clearTimeout(cnpjTimeout)
    const cnpj = $(this).val().replace(/\D/g, '')
    if (cnpj.length === 14) {
      cnpjTimeout = setTimeout(function () {
        $.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
          .done(function (data) {
            $('#Estado').val(data.uf || '')
            $('#Cep').val(data.cep || '')
            $('#Email').val(data.email || '')
            $('#Bairro').val(data.bairro || '')
            $('#Numero').val(data.numero || '')
            $('#Cidade').val(data.municipio || '')
            $('#Endereco').val(data.logradouro || '')
            $('#Complemento').val(data.complemento || '')
            $('#RazaoSocial').val(data.razao_social || '')
            $('#NomeFantasia').val(data.nome_fantasia || '')
            $('#Nome').val(data.nome_fantasia || data.razao_social)
            $('#Telefone').val(data.ddd_telefone_1 || '')
            $('#DataNascimento').val(data.data_inicio_atividade || '')
            if ($('#Nome').val() === '') $('#Nome').focus()
          })
          .fail(function () {
            alert('Erro ao consultar CNPJ.')
          })
      }, 800)
    }
  })

  // Busca dinâmica de Plano de Contas Pai por tipo (Receita/Despesa)
  function atualizarPlanoContaPorTipo(tipo) {
    // Para cada select relevante na tela
    ;['#planoPaiSelect', '#planoContaSelect'].forEach(function (selector) {
      const $select = $(selector)
      if (!$select.length) return
      $select.empty().append('<option value="">-- Nenhum --</option>')
      if (tipo) {
        fetch(`/PlanoContas/ObterPlanosPorTipo?tipo=${tipo}`)
          .then((response) => response.json())
          .then((data) => {
            data.forEach((p) => {
              $select.append(new Option(p.descricao, p.id))
            })
            $select.trigger('change.select2')
          })
      }
    })
  }

  // Detecta mudança em radio ou select de tipo
  const $tipoRadios = $('input[name="Tipo"]')
  if ($tipoRadios.length) {
    $tipoRadios.on('change', function () {
      atualizarPlanoContaPorTipo(this.value)
    })
    // Atualiza ao carregar a página (caso já tenha um selecionado)
    const checked = $tipoRadios.filter(':checked').val()
    if (checked) atualizarPlanoContaPorTipo(checked)
  }
  const $tipoSelect = $('#Tipo')
  if ($tipoSelect.length) {
    $tipoSelect.on('change', function () {
      atualizarPlanoContaPorTipo(this.value)
    })
    if ($tipoSelect.val()) atualizarPlanoContaPorTipo($tipoSelect.val())
  }

  // Remove máscaras dos campos antes do submit de qualquer formulário
  $('form').on('submit', function () {
    // CPF
    var $cpf = $('#Cpf')
    if ($cpf.length) {
      var cpfVal = $cpf.val()
      $cpf.val(cpfVal.replace(/\D/g, ''))
    }
    // CNPJ
    if ($('#Cnpj').length) {
      $('#Cnpj').val(
        $('#Cnpj').cleanVal
          ? $('#Cnpj').cleanVal()
          : $('#Cnpj').val().replace(/\D/g, ''),
      )
    }
    // Telefone
    if ($('#Telefone').length) {
      $('#Telefone').val(
        $('#Telefone').cleanVal
          ? $('#Telefone').cleanVal()
          : $('#Telefone').val().replace(/\D/g, ''),
      )
    }
    // RG
    if ($('#Rg').length) {
      $('#Rg').val(
        $('#Rg').cleanVal
          ? $('#Rg').cleanVal()
          : $('#Rg').val().replace(/\D/g, ''),
      )
    }
    // CEP
    if ($('#Cep').length) {
      $('#Cep').val(
        $('#Cep').cleanVal
          ? $('#Cep').cleanVal()
          : $('#Cep').val().replace(/\D/g, ''),
      )
    }
  })
})
