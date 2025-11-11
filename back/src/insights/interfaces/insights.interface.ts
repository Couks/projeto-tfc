// Resposta para dispositivos acessados
export interface DevicesResponse {
  devices: Array<{
    deviceType: string; // tipo de dispositivo
    os: string; // sistema operacional
    browser: string; // navegador
    count: number; // quantidade de acessos
  }>;
}

// Resposta para série temporal de dispositivos
export interface DevicesTimeSeriesResponse {
  data: Array<{
    date: string; // data da métrica
    mobile: number; // acessos em dispositivos móveis
    desktop: number; // acessos em desktop
  }>;
  period: {
    start: string; // início do período
    end: string; // fim do período
  };
}
