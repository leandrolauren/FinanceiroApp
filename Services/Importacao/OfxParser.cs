using System.Text;
using FinanceiroApp.Dtos;
using OfxNet;

namespace FinanceiroApp.Services
{
    public class OfxParser : IFileParser
    {
        static OfxParser()
        {
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
        }

        public Task<IEnumerable<OfxTransactionDto>> Parse(IFormFile file)
        {
            var ofxTransactions = new List<OfxTransactionDto>();
            try
            {
                using (var stream = file.OpenReadStream())
                {
                    var ofxDocument = OfxDocument.Load(stream);

                    foreach (var statement in ofxDocument.GetStatements())
                    {
                        if (
                            statement.TransactionList != null
                            && statement.TransactionList.Transactions != null
                        )
                        {
                            foreach (var trx in statement.TransactionList.Transactions)
                            {
                                var descriptionBuilder = new StringBuilder();
                                if (!string.IsNullOrWhiteSpace(trx.Name))
                                {
                                    descriptionBuilder.Append(trx.Name);
                                }
                                if (!string.IsNullOrWhiteSpace(trx.Memo))
                                {
                                    if (descriptionBuilder.Length > 0)
                                    {
                                        descriptionBuilder.Append(" - ");
                                    }
                                    descriptionBuilder.Append(trx.Memo);
                                }

                                ofxTransactions.Add(
                                    new OfxTransactionDto
                                    {
                                        FitId = trx.FitId,
                                        Date = trx.DatePosted.DateTime,
                                        Amount = trx.Amount / 100,
                                        Description = descriptionBuilder.ToString(),
                                        Type = trx.TxType.ToString(),
                                    }
                                );
                            }
                        }
                    }
                }
            }
            catch (OfxException ex)
            {
                throw new InvalidDataException(
                    "O arquivo OFX parece estar corrompido ou fora do padrão. Detalhes: "
                        + ex.Message,
                    ex
                );
            }

            return Task.FromResult<IEnumerable<OfxTransactionDto>>(ofxTransactions);
        }
    }
}
