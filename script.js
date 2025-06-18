fetch('https://v0-new-project-wndpayl978c.vercel.app/api/flights-complete')
  .then(res => res.json())
  .then(data => {
    const arrivals = (data && data.success && data.data.arrivals) ? data.data.arrivals : [];
    console.log("Total voos recebidos:", arrivals.length, arrivals);

    // Filtro: GRU + progress < 100
    const filteredArrivals = arrivals.filter(flight => {
      const destIcao = flight.destination?.code_icao;
      const destIata = flight.destination?.code_iata;
      const progress = typeof flight.progress_percent === "number" ? flight.progress_percent : null;
      return (
        (destIcao === "SBGR" || destIata === "GRU") &&
        progress !== null &&
        progress < 100
      );
    });
    console.log("Voos filtrados (GRU e progress<100):", filteredArrivals.length, filteredArrivals);

    if (!filteredArrivals.length) {
      document.getElementById('flights').innerText = 'Nenhum voo encontrado.';
      return;
    }

    filteredArrivals.forEach(flight => {
      const sta = new Date(flight.scheduled_in);
      const eta = new Date(flight.estimated_in);
      flight.delay = Math.round((eta - sta) / 60000);
    });

    filteredArrivals.sort((a, b) => b.delay - a.delay);

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
            <th>Progress (%)</th>
          </tr>
        </thead>
        <tbody>
          ${filteredArrivals.map(flight => {
            const sta = new Date(flight.scheduled_in).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
            const eta = new Date(flight.estimated_in).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
            let delayClass = 'delay-zero';
            if (flight.delay > 0) delayClass = 'delay-positive';
            else if (flight.delay < 0) delayClass = 'delay-negative';
            return `
              <tr>
                <td>${flight.operator_icao || '-'}</td>
                <td>${flight.ident_iata || '-'}</td>
                <td>${flight.origin?.code_iata || '-'}</td>
                <td>${sta}</td>
                <td>${eta}</td>
                <td class="${delayClass}">${flight.delay}</td>
                <td>${typeof flight.progress_percent === "number" ? flight.progress_percent : '-'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    document.getElementById('flights').innerHTML = html;
  })
  .catch((e) => {
    document.getElementById('flights').innerText = 'Erro ao carregar os voos.';
    console.error(e);
  });
