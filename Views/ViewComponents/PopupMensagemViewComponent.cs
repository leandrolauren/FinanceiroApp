using Microsoft.AspNetCore.Mvc;

namespace FinanceiroApp.ViewComponents
{
    public class PopupMensagemViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke()
        {
            var erro = TempData["MensagemErro"] as string;
            var sucesso = TempData["MensagemSucesso"] as string;

            var mensagem = !string.IsNullOrEmpty(erro) ? erro : sucesso;
            var tipo = !string.IsNullOrEmpty(erro) ? "erro" : "sucesso";

            if (string.IsNullOrEmpty(mensagem))
                return Content("");

            ViewBag.Tipo = tipo;
            return View("Default", mensagem);
        }
    }
}
