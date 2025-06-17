fetch('https://v0-new-project-wndpayl978c.vercel.app/api/flights-complete')
  .then(res => res.json())
  .then(data => {
    const arrivals = (data && data.success && data.data.arrivals) ? data.data.arrivals : [];
    const departures = (data && data.success && data.data.departures) ? data.data.departures : [];

    // Processa chegadas
    arrivals.forEach(flight => {
      const sta = new Date(flight.scheduled_in);
      const eta = new Date(flight.estimated_in);
      flight.delay = Math.round((eta - sta) / 60000); // atraso em minutos
    });
    arrivals.sort((a, b) => b.delay - a.delay);

    // Processa partidas
    departures.forEach(flight => {
      const sta = new Date(flight.scheduled_out);
      const eta = new Date(flight.estimated_out);
      flight.delay = Math.round((eta - sta) / 60000); // atraso em minutos
    });
    departures.sort((a, b) => b.delay - a.delay);

    function renderTable(flights, isArrival = true) {
      if (!flights.length) {
        return '<div style="margin-bottom:16px;">Nenhum voo encontrado.</div>';
      }
      return `
        <table class="flights-table">
          <thead>
            <tr>
              <th>Companhia</th>
              <th>Número Voo</th>
              <th>${isArrival ? 'Origem' : 'Destino'}</th>
              <th>STA</th>
              <th>ETA</th>
              <th>Atraso (min)</th>
            </tr>
          </thead>
          <tbody>
            ${flights.map(flight => {
              // Para chegada: origem é 'origin.ident_iata', para partida: destino é 'destination.ident_iata'
              const sta = new Date(isArrival ? flight.scheduled_in : flight.scheduled_out).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
              const eta = new Date(isArrival ? flight.estimated_in : flight.estimated_out).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
              let delayClass = 'delay-zero';
              if (flight.delay > 0) delayClass = 'delay-positive';
              else if (flight.delay < 0) delayClass = 'delay-negative';
              return `
                <tr>
                  <td>${flight.operator_icao || '-'}</td>
                  <td>${flight.ident_iata || '-'}</td>
                  <td>${isArrival 
                        ? (flight.origin && flight.origin.ident_iata ? flight.origin.ident_iata : '-') 
                        : (flight.destination && flight.destination.ident_iata ? flight.destination.ident_iata : '-')}</td>
                  <td>${sta}</td>
                  <td>${eta}</td>
                  <td class="${delayClass}">${flight.delay}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }

    let html = `
      <h2>Chegadas</h2>
      ${renderTable(arrivals, true)}
      <h2>Partidas</h2>
      ${renderTable(departures, false)}
    `;

    document.getElementById('flights').innerHTML = html;
  })
  .catch(() => {
    document.getElementById('flights').innerText = 'Erro ao carregar os voos.';
  });
