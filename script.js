fetch('https://v0-new-project-wndpayl978c.vercel.app/api/flights-complete')
  .then(res => res.json())
  .then(data => {
    const arrivals = (data && data.success && data.data.arrivals) ? data.data.arrivals : [];
    if (!arrivals.length) {
      document.getElementById('flights').innerText = 'Nenhum voo encontrado.';
      return;
    }

    // Define se o voo acabou de chegar (progress 100 e status especial)
    function acabouDeChegar(flight) {
      if (typeof flight.progress_percent !== "number" || flight.progress_percent !== 100) return false;
      const status = (flight.status || "").toLowerCase();
      return (
        status.includes("chegou") ||
        status.includes("aterrissou") ||
        status.includes("pouso") ||
        status.includes("gate") ||
        status.includes("portão")
      );
    }

    // Filtra voos com destino GRU: em andamento, recém-chegados ou progress null
    const filteredArrivals = arrivals.filter(flight => {
      const destIcao = (flight.destination?.code_icao || '').toUpperCase();
      const destIata = (flight.destination?.code_iata || '').toUpperCase();
      const progressRaw = flight.progress_percent;
      const progress = typeof progressRaw === "number" ? progressRaw : null;
      const isGRU = destIcao === "SBGR" || destIata === "GRU";
      return isGRU && (
        progress === null ||
        progress < 100 ||
        acabouDeChegar(flight)
      );
    });

    if (!filteredArrivals.length) {
      document.getElementById('flights').innerText = 'Nenhum voo encontrado.';
      return;
    }

    // Calcula atraso (delay)
    filteredArrivals.forEach(flight => {
      const sta = flight.scheduled_in ? new Date(flight.scheduled_in) : null;
      const eta = flight.estimated_in ? new Date(flight.estimated_in) : null;
      flight.delay = (sta && eta) ? Math.round((eta - sta) / 60000) : '-';
    });

    // Ordena por atraso (maior atraso primeiro; '-' vai pro fim)
    filteredArrivals.sort((a, b) => {
      if (a.delay === '-' && b.delay === '-') return 0;
      if (a.delay === '-') return 1;
      if (b.delay === '-') return -1;
      return b.delay - a.delay;
    });

    // Monta HTML da tabela
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
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${filteredArrivals.map(flight => {
            const sta = flight.scheduled_in ? new Date(flight.scheduled_in).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }) : '-';
            const eta = flight.estimated_in ? new Date(flight.estimated_in).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }) : '-';
            let delayClass = 'delay-zero';
            if (flight.delay !== '-' && flight.delay > 0) delayClass = 'delay-positive';
            else if (flight.delay !== '-' && flight.delay < 0) delayClass = 'delay-negative';
            return `
              <tr>
                <td>${flight.operator_icao || '-'}</td>
                <td>${flight.ident_iata || '-'}</td>
                <td>${flight.origin?.code_iata || '-'}</td>
                <td>${sta}</td>
                <td>${eta}</td>
                <td class="${delayClass}">${flight.delay}</td>
                <td>${flight.progress_percent !== null && flight.progress_percent !== undefined ? flight.progress_percent : '-'}</td>
                <td>${flight.status || '-'}</td>
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
