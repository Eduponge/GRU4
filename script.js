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

    function isArrivalGRU(f) {
      return (
        (f.destination_code_icao === "SBGR" || f.destination_code_iata === "GRU") ||
        (f.destination && (f.destination.code_icao === "SBGR" || f.destination.code_iata === "GRU")) ||
        (f.airport_dest && (f.airport_dest.code_icao === "SBGR" || f.airport_dest.code_iata === "GRU"))
      );
    }

    function isDepartureGRU(f) {
      return (
        (f.origin_code_icao === "SBGR" || f.origin_code_iata === "GRU") ||
        (f.origin && (f.origin.code_icao === "SBGR" || f.origin.code_iata === "GRU")) ||
        (f.airport_orig && (f.airport_orig.code_icao === "SBGR" || f.airport_orig.code_iata === "GRU"))
      );
    }

    const arrivalsGRU = flights.filter(isArrivalGRU);
    const departuresGRU = flights.filter(isDepartureGRU);

    function getDelayMin(f) {
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

    // Formata apenas hora/minuto
    function formatHour(value) {
      if (!value) return '-';
      const d = new Date(value);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    function getEstimatedIn(f) {
      return f.estimated_in || (f.estimated && f.estimated.in);
    }

    function getOriginIata(f) {
      return (
        (f.origin && f.origin.code_iata) ||
        f.origin_code_iata ||
        (f.airport_orig && f.airport_orig.code_iata) ||
        '-'
      );
    }

    function getDestinationIata(f) {
      return (
        (f.destination && f.destination.code_iata) ||
        f.destination_code_iata ||
        (f.airport_dest && f.airport_dest.code_iata) ||
        '-'
      );
    }

    function renderTable(voos, tipo) {
      if (!voos.length) return `<p class="no-flights">Nenhum voo ${tipo} encontrado.</p>`;
      // Ordena pela coluna "Estimado" do mais antigo para o mais futuro
      voos = voos.slice().sort((a, b) => {
        const aEstim = getEstimatedIn(a);
        const bEstim = getEstimatedIn(b);
        if (!aEstim) return 1;
        if (!bEstim) return -1;
        return new Date(aEstim) - new Date(bEstim);
      });
      let html = `<h2>${tipo}</h2>`;
      html += `<div class="table-responsive"><table class="flights-table"><thead>
        <tr>
          <th>Ident</th>`;
      if (tipo.startsWith('Chegadas')) {
        html += `<th>Origem</th>`;
      } else {
        html += `<th>Destino</th>`;
      }
      html += `<th>Status</th>
          <th>Previsto</th>
          <th>Estimado</th>
          <th>Atraso/<br>Antecipação (min)</th>
          <th>Progresso (%)</th>
        </tr></thead><tbody>`;
      voos.forEach(flight => {
        let sched = flight.scheduled_in || (flight.scheduled && flight.scheduled.in);
        let estim = flight.estimated_in || (flight.estimated && flight.estimated.in);
        const atraso = getDelayMin(flight);
        html += `<tr>
          <td>${flight.ident}</td>`;
        if (tipo.startsWith('Chegadas')) {
          html += `<td>${getOriginIata(flight)}</td>`;
        } else {
          html += `<td>${getDestinationIata(flight)}</td>`;
        }
        html += `
          <td class="status-${flight.status?.toLowerCase() || 'unknown'}">${flight.status ?? '-'}</td>
          <td>${formatHour(sched)}</td>
          <td>${formatHour(estim)}</td>
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
