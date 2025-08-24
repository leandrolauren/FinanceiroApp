import React from 'react';
import { IMaskInput } from 'react-imask';
import axios from 'axios';

// --- Componentes de Máscara Reutilizáveis ---

export const CpfMask = React.forwardRef(function CpfMask(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="000.000.000-00"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

export const CnpjMask = React.forwardRef(function CnpjMask(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00.000.000/0000-00"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

export const TelefoneMask = React.forwardRef(function TelefoneMask(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

export const CepMask = React.forwardRef(function CepMask(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00000-000"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});


// --- Funções de API (Lógica de busca de dados) ---

export const buscarEnderecoPorCep = async (cep) => {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) {
    throw new Error('CEP inválido.');
  }
  const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  if (response.data.erro) {
    throw new Error('CEP não encontrado.');
  }
  return response.data;
};

export const buscarDadosPorCnpj = async (cnpj) => {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  if (cnpjLimpo.length !== 14) {
    throw new Error('CNPJ inválido.');
  }
  const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
  return response.data;
};

// --- Funções de Manipulação de Dados ---

export const limparMascaras = (formData) => {
  const dadosLimpos = { ...formData };
  
  if (dadosLimpos.cpf) dadosLimpos.cpf = dadosLimpos.cpf.replace(/\D/g, '');
  if (dadosLimpos.cnpj) dadosLimpos.cnpj = dadosLimpos.cnpj.replace(/\D/g, '');
  if (dadosLimpos.cep) dadosLimpos.cep = dadosLimpos.cep.replace(/\D/g, '');
  if (dadosLimpos.telefone) dadosLimpos.telefone = dadosLimpos.telefone.replace(/\D/g, '');

  return dadosLimpos;
};