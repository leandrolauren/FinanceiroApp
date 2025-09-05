namespace FinanceiroApp.Services
{
    public class AgentActionResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public object? Data { get; set; }
        public bool RequiresConfirmation { get; set; } = false;
    }

    public interface IAgentActionService
    {
        Task<AgentActionResult> CriarLancamentoDespesa(
            string descricao,
            decimal valor,
            DateTime dataVencimento,
            string nomePessoa,
            string nomePlanoContas,
            DateTime? dataPagamento,
            string? nomeContaBancaria
        );

        Task<AgentActionResult> CriarPessoa(
            string nome,
            string? email,
            string? cpf,
            string? cnpj,
            bool confirmado = false
        );

        Task<AgentActionResult> ExcluirPessoa(string nomePessoa, bool confirmado = false);

        Task<AgentActionResult> ConsultarSaldoContaBancaria(string nomeContaBancaria);
    }
}
