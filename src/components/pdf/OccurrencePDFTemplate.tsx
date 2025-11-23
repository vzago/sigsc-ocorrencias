import React from 'react';
import { OccurrenceDisplay } from '@/types/occurrence.types';
import { Badge } from '@/components/ui/badge';
import {
  TreePine,
  AlertTriangle,
  Flame,
  Building2,
  MapPin,
  User,
  Calendar,
  FileText,
  CheckCircle2,
  Truck,
  Target,
  Hash,
  Clock,
  Tag,
  Code,
  Shield,
  Thermometer,
  Droplets,
  Waves
} from 'lucide-react';

interface OccurrencePDFTemplateProps {
  occurrence: OccurrenceDisplay;
}

const categoryIcons = {
  vistoria_ambiental: TreePine,
  risco_vegetacao: AlertTriangle,
  incendio_vegetacao: Flame,
  outras: Building2
};

const categoryLabels = {
  vistoria_ambiental: "Vistoria Ambiental",
  risco_vegetacao: "Risco - Vegetação/Árvore",
  incendio_vegetacao: "Incêndio em Vegetação",
  outras: "Outras Ocorrências"
};

const statusLabels = {
  aberta: "Aberta",
  andamento: "Em Andamento",
  fechada: "Fechada"
};

export const OccurrencePDFTemplate: React.FC<OccurrencePDFTemplateProps> = ({ occurrence }) => {
  const CategoryIcon = categoryIcons[occurrence.category];

  return (
    <div id="occurrence-pdf-content" className="w-[210mm] bg-white text-slate-900 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-primary pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <CategoryIcon className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary leading-tight">Relatório de Ocorrência</h1>
            <p className="text-sm text-slate-500">Defesa Civil de São Carlos</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-900 leading-tight">R.A. {occurrence.ra}</div>
          <div className="text-sm text-slate-500">Gerado em {new Date().toLocaleDateString('pt-BR')}</div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg mb-8 border border-slate-200">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Status Atual:</span>
          <Badge variant="outline" className="uppercase bg-white px-3 py-1 h-auto self-center">
            {statusLabels[occurrence.status]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Data de Registro: {occurrence.dateTime}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Dados Gerais */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-primary border-b border-primary/20 pb-2">
            <FileText className="w-5 h-5" />
            Dados Gerais
          </h2>
          <div className="space-y-2 text-sm">
            {occurrence.sspdsNumber && (
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Número SSPDS</span>
                <span className="font-medium">{occurrence.sspdsNumber}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="text-slate-500">Categoria</span>
              <span className="font-medium">{categoryLabels[occurrence.category]}</span>
            </div>
            {occurrence.subcategory && (
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Subcategoria</span>
                <span className="font-medium">{occurrence.subcategory}</span>
              </div>
            )}
            {occurrence.cobradeCode && (
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Código COBRADE</span>
                <span className="font-medium">{occurrence.cobradeCode}</span>
              </div>
            )}
            {occurrence.endDateTime && (
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Data/Hora Fim</span>
                <span className="font-medium">{occurrence.endDateTime}</span>
              </div>
            )}
            {occurrence.origins && occurrence.origins.length > 0 && (
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-1">
                <span className="text-slate-500">Origem do Chamado</span>
                <div className="flex flex-wrap gap-1">
                  {occurrence.origins.map((origin, i) => (
                    <span key={i} className="bg-slate-100 px-2 py-0.5 rounded text-xs">{origin}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Localização */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-primary border-b border-primary/20 pb-2">
            <MapPin className="w-5 h-5" />
            Localização
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex flex-col gap-1 border-b border-slate-100 pb-1">
              <span className="text-slate-500">Endereço</span>
              <span className="font-medium">{occurrence.address}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {occurrence.addressNumber && (
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Número</span>
                  <span className="font-medium">{occurrence.addressNumber}</span>
                </div>
              )}
              {occurrence.neighborhood && (
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Bairro</span>
                  <span className="font-medium">{occurrence.neighborhood}</span>
                </div>
              )}
            </div>
            {occurrence.reference && (
              <div className="flex flex-col gap-1 border-b border-slate-100 pb-1">
                <span className="text-slate-500">Referência</span>
                <span className="font-medium">{occurrence.reference}</span>
              </div>
            )}
            {(occurrence.latitude || occurrence.longitude) && (
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Coordenadas</span>
                <span className="font-mono text-xs">{occurrence.latitude}, {occurrence.longitude}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Solicitante */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-primary border-b border-primary/20 pb-2">
            <User className="w-5 h-5" />
            Solicitante
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="text-slate-500">Nome</span>
              <span className="font-medium">{occurrence.requester}</span>
            </div>
            {occurrence.institution && (
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Instituição</span>
                <span className="font-medium">{occurrence.institution}</span>
              </div>
            )}
            {occurrence.phone && (
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Telefone</span>
                <span className="font-medium">{occurrence.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dados Específicos */}
        {(occurrence.areaType || occurrence.affectedArea || occurrence.temperature || occurrence.humidity || occurrence.impactType) && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-primary border-b border-primary/20 pb-2">
              <Target className="w-5 h-5" />
              Dados Específicos
            </h2>
            <div className="space-y-2 text-sm">
              {occurrence.areaType && (
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Tipo de Área</span>
                  <span className="font-medium">{occurrence.areaType}</span>
                </div>
              )}
              {occurrence.affectedArea && (
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Área Atingida</span>
                  <span className="font-medium">{occurrence.affectedArea} m²</span>
                </div>
              )}
              {(occurrence.temperature || occurrence.humidity) && (
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Clima</span>
                  <span className="font-medium">
                    {occurrence.temperature ? `${occurrence.temperature}°C` : ''}
                    {occurrence.temperature && occurrence.humidity ? ' / ' : ''}
                    {occurrence.humidity ? `${occurrence.humidity}%` : ''}
                  </span>
                </div>
              )}
              {occurrence.impactType && (
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Impacto</span>
                  <span className="font-medium">{occurrence.impactType}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Descrição e Relatos */}
      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-primary">Descrição da Ocorrência</h2>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-sm text-justify leading-relaxed">
            {occurrence.description}
          </div>
        </div>

        {occurrence.detailedReport && (
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-primary">Relato Detalhado</h2>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-sm text-justify leading-relaxed">
              {occurrence.detailedReport}
            </div>
          </div>
        )}

        {occurrence.observations && (
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-primary">Observações</h2>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-sm text-justify leading-relaxed">
              {occurrence.observations}
            </div>
          </div>
        )}
      </div>

      {/* Providências e Recursos */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {(occurrence.teamActions?.length || occurrence.activatedOrganisms?.length) ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-primary border-b border-primary/20 pb-2">
              <CheckCircle2 className="w-5 h-5" />
              Providências
            </h2>
            <div className="space-y-4 text-sm">
              {occurrence.teamActions && occurrence.teamActions.length > 0 && (
                <div>
                  <span className="text-slate-500 block mb-1">Ações da Equipe</span>
                  <div className="flex flex-wrap gap-1">
                    {occurrence.teamActions.map((action, i) => (
                      <span key={i} className="bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">{action}</span>
                    ))}
                  </div>
                </div>
              )}
              {occurrence.activatedOrganisms && occurrence.activatedOrganisms.length > 0 && (
                <div>
                  <span className="text-slate-500 block mb-1">Órgãos Acionados</span>
                  <div className="flex flex-wrap gap-1">
                    {occurrence.activatedOrganisms.map((org, i) => (
                      <span key={i} className="bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">{org}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {(occurrence.vehicles?.length || occurrence.materials) ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-primary border-b border-primary/20 pb-2">
              <Truck className="w-5 h-5" />
              Recursos
            </h2>
            <div className="space-y-4 text-sm">
              {occurrence.vehicles && occurrence.vehicles.length > 0 && (
                <div>
                  <span className="text-slate-500 block mb-1">Veículos</span>
                  <div className="flex flex-wrap gap-1">
                    {occurrence.vehicles.map((vehicle, i) => (
                      <span key={i} className="bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">{vehicle}</span>
                    ))}
                  </div>
                </div>
              )}
              {occurrence.materials && (
                <div>
                  <span className="text-slate-500 block mb-1">Materiais</span>
                  <p className="text-slate-900">{occurrence.materials}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      {occurrence.responsibleAgents && (
        <div className="pt-8 border-t border-slate-200">
          <div className="text-sm">
            <span className="font-bold text-slate-700">Agentes Responsáveis:</span>
            <span className="ml-2 text-slate-600">{occurrence.responsibleAgents}</span>
          </div>
        </div>
      )}
    </div>
  );
};
