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

    // DEBUG: veja o formato real dos primeiros voos
    if (flights.length) {
      console.log("Amostra de voos:", flights.slice(0, 5));
    } else {
      console.log("Nenhum voo recebido da API.");
    }

    // Função para checar se o voo é chegada em GRU
    function isArrivalGRU(f) {
      // Tenta vários campos possíveis
      return (
        (f.destination_code_icao === "SBGR" || f.destination_code_iata === "GRU") ||
        (f.destination && (f.destination.code_icao === "SBGR" || f.destination.code_iata === "GRU")) ||
        (f.airport_dest && (f.airport_dest.code_icao === "SBGR" || f.airport_dest.code_iata === "GRU"))
      );
    }

    // Função para checar se o voo é partida de GRU
    function isDepartureGRU(f) {
      // Tenta vários campos possíveis
      return (
        (f.origin_code_icao === "SBGR" || f.origin_code_iata === "GRU") ||
        (f.origin && (f.origin.code_icao === "SBGR" || f.origin.code_iata === "GRU")) ||
        (f.airport_orig && (f.airport_orig.code_icao === "SBGR" || f.airport_orig.code_iata === "GRU"))
      );
    }

    const arrivalsGRU = flights.filter(isArrivalGRU);
    const departuresGRU = flights.filter(isDepartureGRU);

    function getDelayMin(f) {
      // Aceita tanto string quanto Date
      let sched = f.scheduled_in || (f.scheduled && f.scheduled.in);
      let estim = f.estimated_in || (f.estimated && f.estimated.in);
      if (!sched || !estim) return null;
      sched = new Date(sched);
      estim = new Date(estim);
      return Math.round((estim - sched) / 60000);
    }

    function delayColor(delay) {
      if (delay === null) return '';
      if (delay > 15) return 'delay-high';
      if (delay > 5) return 'delay-med';
      if (delay >= -5) return 'delay-ok';
      return 'delay-early';
    }

    function formatDate(value) {
      if (!value) return '-';
      const d = new Date(value);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleString('pt-BR');
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
        // Aceita campos alternativos de scheduled_in e estimated_in
        let sched = flight.scheduled_in || (flight.scheduled && flight.scheduled.in);
        let estim = flight.estimated_in || (flight.estimated && flight.estimated.in);
        const atraso = getDelayMin(flight);
        html += `<tr>
          <td>${flight.ident}</td>
          <td class="status-${flight.status?.toLowerCase() || 'unknown'}">${flight.status ?? '-'}</td>
          <td>${formatDate(sched)}</td>
          <td>${formatDate(estim)}</td>
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
