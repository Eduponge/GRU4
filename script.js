fetch('https://v0-new-project-wndpayl978c.vercel.app/api/flights-complete')
  .then(res => res.json())
  .then(data => {
    const allFlights = [
      ...(data.data.arrivals || []),
      ...(data.data.scheduled_arrivals || []),
      ...(data.data.departures || []),
      ...(data.data.scheduled_departures || [])
    ];
    // Remove duplicados se houver
    const flightsMap = {};
    allFlights.forEach(f => { flightsMap[f.ident] = f; });
    const flights = Object.values(flightsMap);

    // Filtra voos que chegam em GRU (arrival) e que saem de GRU (departure)
    const isGRU = f =>
      (f.code_icao === "SBGR" || f.code_iata === "GRU" ||
       f.origin_code_icao === "SBGR" || f.origin_code_iata === "GRU" ||
       f.destination_code_icao === "SBGR" || f.destination_code_iata === "GRU");

    const arrivalsGRU = flights.filter(f =>
      (f.destination_code_icao === "SBGR" || f.destination_code_iata === "GRU") && isGRU(f)
    );
    const departuresGRU = flights.filter(f =>
      (f.origin_code_icao === "SBGR" || f.origin_code_iata === "GRU") && isGRU(f)
    );

    function getDelayMin(f) {
      if (!f.scheduled_in || !f.estimated_in) return null;
      const sched = new Date(f.scheduled_in);
      const estim = new Date(f.estimated_in);
      return Math.round((estim - sched) / 60000);
    }

    function delayColor(delay) {
      if (delay === null) return '';
      if (delay > 15) return 'delay-high';
      if (delay > 5) return 'delay-med';
      if (delay >= -5) return 'delay-ok';
      return 'delay-early';
    }

    function renderTable(voos, tipo) {
      if (!voos.length) return `<p class="no-flights">Nenhum voo ${tipo} encontrado.</p>`;
      voos = voos.slice().sort((a, b) => {
        const dA = getDelayMin(a);
        const dB = getDelayMin(b);
        if (dA === null) return 1;
        if (dB === null) return -1;
        return dB - dA;
      });
      let html = `<h2>${tipo}</h2>`;
      html += `<div class="table-responsive"><table class="flights-table"><thead>
        <tr>
          <th>Ident</th>
          <th>Status</th>
          <th>Previsto</th>
          <th>Estimado</th>
          <th>Atraso/<br>Antecipação (min)</th>
          <th>Progresso (%)</th>
        </tr></thead><tbody>`;
      voos.forEach(flight => {
        const atraso = getDelayMin(flight);
        html += `<tr>
          <td>${flight.ident}</td>
          <td class="status-${flight.status?.toLowerCase() || 'unknown'}">${flight.status ?? '-'}</td>
          <td>${flight.scheduled_in ? new Date(flight.scheduled_in).toLocaleString('pt-BR') : '-'}</td>
          <td>${flight.estimated_in ? new Date(flight.estimated_in).toLocaleString('pt-BR') : '-'}</td>
          <td class="${delayColor(atraso)}">${atraso !== null ? atraso : '-'}</td>
          <td>${flight.progress_percent ?? '-'}</td>
        </tr>`;
      });
      html += '</tbody></table></div>';
      return html;
    }

    let html = '';
    html += renderTable(arrivalsGRU, 'Chegadas em GRU');
    html += renderTable(departuresGRU, 'Partidas de GRU');
    document.getElementById('flights').innerHTML = html;
  })
  .catch(e => {
    document.getElementById('flights').innerText = 'Erro ao carregar os voos.';
    console.error(e);
  });
