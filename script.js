fetch('https://v0-new-project-wndpayl978c.vercel.app/api/flights-complete')
  .then(res => res.json())
  .then(data => {
    const arrivals = (data && data.success && data.data.arrivals) ? data.data.arrivals : [];
    if (!arrivals.length) {
      document.getElementById('flights').innerText = 'Nenhum voo encontrado.';
      return;
    }

    // Hora e minuto atual em America/Sao_Paulo
    const now = new Date();
    const nowSaoPaulo = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const currentHour = nowSaoPaulo.getHours();
    const currentMinute = nowSaoPaulo.getMinutes();

    // Filtra voos cujo ETA seja maior que a hora e minuto atual
    const filteredArrivals = arrivals.filter(flight => {
      if (!flight.estimated_in) return false;
      const etaDate = new Date(flight.estimated_in);
      const etaSaoPaulo = new Date(etaDate.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      const etaHour = etaSaoPaulo.getHours();
      const etaMinute = etaSaoPaulo.getMinutes();
      // Só mostra se ETA > agora
      if (etaHour > currentHour) return true;
      if (etaHour === currentHour && etaMinute > currentMinute) return true;
      return false;
    });

    // Calcula o atraso em minutos para cada voo restante
    filteredArrivals.forEach(flight => {
      const sta = new Date(flight.scheduled_in);
      const eta = new Date(flight.estimated_in);
      flight.delay = Math.round((eta - sta) / 60000); // atraso em minutos
    });

    // Ordena do mais atrasado para o mais adiantado
    filteredArrivals.sort((a, b) => b.delay - a.delay);

    // Monta a tabela
    const html = `
      <table class="flights-table">
        <thead>
          <tr>
            <th>Companhia</th>
            <th>Número Voo</th>
            <th>Origem</th>
            <th>STA</th>
            <th>ETA</th>
            <th>Atraso (min)</th>
          </tr>
        </thead>
        <tbody>
          ${filteredArrivals.map(flight => {
            const sta = new Date(flight.scheduled_in).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
            const eta = new Date(flight.estimated_in).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
            let delayClass = 'delay-zero';
            if (flight.delay > 0) delayClass = 'delay-positive';
            else if (flight.delay < 0) delayClass = 'delay-negative';
            // Origem: origin.code_icao
            return `
              <tr>
                <td>${flight.operator_icao || '-'}</td>
                <td>${flight.ident_iata || '-'}</td>
                <td>${flight.origin && flight.origin.code_icao ? flight.origin.code_icao : '-'}</td>
                <td>${sta}</td>
                <td>${eta}</td>
                <td class="${delayClass}">${flight.delay}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    document.getElementById('flights').innerHTML = html;
  })
  .catch(() => {
    document.getElementById('flights').innerText = 'Erro ao carregar os voos.';
  });
