fetch('https://v0-new-project-wndpayl978c.vercel.app/api/flights-complete')
  .then(res => res.json())
  .then(data => {
    // Junta todos os voos dos principais arrays, evitando duplicados pelo 'ident'
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

    console.log("Todos os voos recebidos:", flights.map(v => v.ident));
    if (!flights.length) {
      document.getElementById('flights').innerText = 'Nenhum voo encontrado.';
      return;
    }
    let html = `<table class="flights-table"><thead><tr><th>Ident</th><th>Status</th><th>Progress (%)</th></tr></thead><tbody>`;
    flights.forEach(flight => {
      html += `<tr>
        <td>${flight.ident}</td>
        <td>${flight.status}</td>
        <td>${flight.progress_percent ?? '-'}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    document.getElementById('flights').innerHTML = html;
  })
  .catch(e => {
    document.getElementById('flights').innerText = 'Erro ao carregar os voos.';
    console.error(e);
  });
