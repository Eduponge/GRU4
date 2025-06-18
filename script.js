fetch('https://v0-new-project-wndpayl978c.vercel.app/api/flights-complete')
  .then(res => res.json())
  .then(data => {
    const arrivals = (data && data.success && data.data.arrivals) ? data.data.arrivals : [];
    console.log("Voos recebidos:", arrivals.map(v => v.ident));
    if (!arrivals.length) {
      document.getElementById('flights').innerText = 'Nenhum voo encontrado.';
      return;
    }
    let html = `<table class="flights-table"><thead><tr><th>Ident</th><th>Status</th></tr></thead><tbody>`;
    arrivals.forEach(flight => {
      html += `<tr>
        <td>${flight.ident}</td>
        <td>${flight.status}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    document.getElementById('flights').innerHTML = html;
  });
