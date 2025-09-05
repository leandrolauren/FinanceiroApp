using FinanceiroApp.Data;
using FinanceiroApp.Dtos;
using FinanceiroApp.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceiroApp.Services
{
    public class PessoaService : IPessoaService
    {
        private readonly ApplicationDbContext _context;

        public PessoaService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PessoaModel> CreatePessoaAsync(CriarPessoaDto dto, int userId)
        {
            var pessoa = new PessoaModel
            {
                Nome = dto.Nome,
                RazaoSocial = dto.RazaoSocial,
                NomeFantasia = dto.NomeFantasia,
                Cnpj = dto.Cnpj,
                Tipo = (TipoPessoa?)dto.Tipo,
                Email = dto.Email,
                Telefone = dto.Telefone,
                Endereco = dto.Endereco,
                Cep = dto.Cep,
                Numero = dto.Numero,
                Bairro = dto.Bairro,
                Complemento = dto.Complemento,
                Cidade = dto.Cidade,
                Estado = dto.Estado,
                InscricaoEstadual = dto.InscricaoEstadual,
                Cpf = dto.Cpf,
                Rg = dto.Rg,
                DataNascimento = dto.DataNascimento,
                UsuarioId = userId,
            };

            _context.Pessoas.Add(pessoa);
            await _context.SaveChangesAsync();
            return pessoa;
        }

        public async Task<PessoaModel?> UpdatePessoaAsync(
            int pessoaId,
            EditPessoaDto dto,
            int userId
        )
        {
            var pessoaDb = await _context.Pessoas.FirstOrDefaultAsync(p =>
                p.Id == pessoaId && p.UsuarioId == userId
            );

            if (pessoaDb == null)
            {
                return null;
            }

            pessoaDb.Nome = dto.Nome;
            pessoaDb.RazaoSocial = dto.RazaoSocial;
            pessoaDb.Email = dto.Email;
            pessoaDb.Telefone = dto.Telefone;
            pessoaDb.Endereco = dto.Endereco;
            pessoaDb.Cep = dto.Cep;
            pessoaDb.Numero = dto.Numero;
            pessoaDb.Bairro = dto.Bairro;
            pessoaDb.Complemento = dto.Complemento;
            pessoaDb.Cidade = dto.Cidade;
            pessoaDb.Estado = dto.Estado;
            pessoaDb.NomeFantasia = dto.NomeFantasia;
            pessoaDb.InscricaoEstadual = dto.InscricaoEstadual;
            pessoaDb.Cpf = dto.Cpf;
            pessoaDb.Cnpj = dto.Cnpj;
            pessoaDb.Rg = dto.Rg;
            pessoaDb.DataNascimento = dto.DataNascimento;

            await _context.SaveChangesAsync();
            return pessoaDb;
        }

        public async Task<bool> DeletePessoaAsync(int pessoaId, int userId)
        {
            var pessoa = await _context.Pessoas.FirstOrDefaultAsync(p =>
                p.Id == pessoaId && p.UsuarioId == userId
            );

            if (pessoa == null)
            {
                throw new KeyNotFoundException("Pessoa não encontrada.");
            }

            bool temLancamentos = await _context.Lancamentos.AnyAsync(l => l.PessoaId == pessoaId);
            if (temLancamentos)
            {
                throw new InvalidOperationException(
                    "Não é possível excluir pessoa com lançamentos vinculados."
                );
            }

            _context.Pessoas.Remove(pessoa);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
