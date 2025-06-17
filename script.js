fetch('https://v0-new-project-wndpayl978c.vercel.app/api/flights-complete')
  .then(res => res.json())
  .then(data => {
    const arrivals = (data && data.success && data.data.arrivals) ? data.data.arrivals : [];
    if (!arrivals.length) {
      document.getElementById('flights').innerText = 'Nenhum voo encontrado.';
      return;
    }

    // Hora atual em America/Sao_Paulo (com seconds zerados para evitar inconsistências de segundo)
    const now = new Date();
    const nowSaoPaulo = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    nowSaoPaulo.setSeconds(0, 0);

    // Filtra voos cujo ETA (estimated_in) seja maior que a data/hora/minuto atual
    const filteredArrivals = arrivals.filter(flight => {
      if (!flight.estimated_in) return false;
      const etaSaoPaulo = new Date(new Date(flight.estimated_in).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
      etaSaoPaulo.setSeconds(0, 0);
      return etaSaoPaulo > nowSaoPaulo;
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
