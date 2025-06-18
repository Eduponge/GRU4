fetch('https://v0-new-project-wndpayl978c.vercel.app/api/flights-complete')
  .then(res => res.json())
  .then(data => {
    const arrivals = (data && data.success && data.data.arrivals) ? data.data.arrivals : [];
    // Debug: veja todos os voos no console
    console.log("Voos recebidos:", arrivals.map(v => v.ident));
    if (!arrivals.length) {
      document.getElementById('flights').innerText = 'Nenhum voo encontrado.';
      return;
    }
    // Monta HTML da tabela
    let html = `
      <table class="flights-table">
        <thead>
          <tr>
            <th>Ident</th>
            <th>Companhia</th>
            <th>Número Voo</th>
            <th>Origem</th>
            <th>Destino</th>
            <th>STA</th>
            <th>ETA</th>
            <th>Progress (%)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;
    arrivals.forEach(flight => {
      const sta = flight.scheduled_in
        ? new Date(flight.scheduled_in).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
        : '-';
      const eta = flight.estimated_in
        ? new Date(flight.estimated_in).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
        : '-';
      html += `
        <tr>
          <td>${flight.ident || '-'}</td>
          <td>${flight.operator_icao || '-'}</td>
          <td>${flight.flight_number || '-'}</td>
          <td>${flight.origin?.code_iata || '-'}</td>
          <td>${flight.destination?.code_iata || '-'}</td>
          <td>${sta}</td>
          <td>${eta}</td>
          <td>${flight.progress_percent ?? '-'}</td>
          <td>${flight.status || '-'}</td>
        </tr>
      `;
    });
    html += '</tbody></table>';
    document.getElementById('flights').innerHTML = html;
  })
  .catch(e => {
    document.getElementById('flights').innerText = 'Erro ao carregar os voos.';
    console.error(e);
  });
