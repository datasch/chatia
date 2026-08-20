/** 
 * @TercioSantos-0 |
 * controller/get/todas as configurações de 1 empresa |
 * controller/get/1 configuração específica |
 * controller/put/atualização de 1 configuração |
 * @param:companyId
 */
import { Request, Response } from "express";
import FindCompanySettingsService from "../services/CompaniesSettings/FindCompanySettingsService";
import UpdateCompanySettingsService from "../services/CompaniesSettings/UpdateCompanySettingService";
import FindCompanySettingOneService from "../services/CompaniesSettings/FindCompanySettingOneService";
import { testSMTPConnection, SendMail } from "../helpers/SendMail";

type IndexGetCompanySettingQuery = {
  companyId: number;
  column: string;
  data:string;
};

type IndexGetCompanySettingOneQuery = {
  column: string;
};

export const show = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { companyId } = req.user;

    const settings = await FindCompanySettingsService({
      companyId
    });

    return res.status(200).json(settings);
  };


  export const showOne = async (req: Request, res: Response): Promise<Response> => {
    const { column } = req.query as IndexGetCompanySettingOneQuery;
    const { companyId } = req.user;

    if (!column) {
      return res.status(400).json({ error: "Parameter 'column' is required" });
    }

    const setting = await FindCompanySettingOneService({
      companyId,
      column
    });

    return res.status(200).json(setting[0]);
  };

export const update = async(
  req: Request,
  res: Response
): Promise<Response> => {
  const {  column, data } = req.body as IndexGetCompanySettingQuery;
  const { companyId } = req.user;

  const result = await UpdateCompanySettingsService({
    companyId,
    column,
    data
  })

  return res.status(200).json({response:true, result:result});
}

export const testSmtp = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const result = await testSMTPConnection(companyId);
  return res.status(result.success ? 200 : 400).json(result);
};

export const sendTestEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "E-mail é obrigatório." });
  }

  try {
    await SendMail({
      to: email,
      subject: "Prueba SMTP - Gissap CRM",
      text: "Este es un correo de prueba de Gissap CRM (Giantucchi Ecosystem). Si has recibido este mensaje, el servidor SMTP está configurado correctamente.",
      html: "<h2>Prueba SMTP - Gissap CRM</h2><p>Este es un correo de prueba de Gissap CRM. Si has recibido este mensaje, el servidor SMTP está configurado correctamente.</p>"
    }, companyId);
    return res.status(200).json({ success: true, message: "Correo de prueba enviado con éxito." });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || "Erro ao enviar e-mail de teste." });
  }
};
