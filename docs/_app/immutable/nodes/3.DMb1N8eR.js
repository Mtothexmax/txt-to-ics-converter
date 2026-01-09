import{w as u,a as y,f as b}from"../chunks/BYaZGKia.js";import"../chunks/Pu9JFYFi.js";import{j as t,s as e,t as g,k as o,n as d}from"../chunks/CKch0Ex6.js";import{s as f}from"../chunks/BH7NJh3d.js";import{b as v}from"../chunks/CODcUNSy.js";var h=u(b(`<section style="max-width:1100px; margin:0 auto; font-family:var(--font-sans);"><h2 style="margin-top:0;">Review Your Appointments</h2> <div style="display:flex; gap:1rem; align-items:center; margin-bottom:1rem;"><div><label for="sort">Sort:</label> <select id="sort" style="padding:.35rem; border-radius:6px;"><option>Date Ascending</option><option>Date Descending</option></select></div> <div style="margin-left:auto;"><button id="download-top" style="padding:.5rem .75rem; border-radius:6px; background:var(--color-primary); color:var(--color-primary-foreground); border:none; cursor:pointer; display:flex; gap:.5rem; align-items:center;" aria-label="Download ICS"><span class="material-icons" aria-hidden="true">download</span>Download ICS File</button></div></div> <div id="no-data" style="color:var(--color-muted-foreground); display:none;">No appointments found. Go back to the <a>landing page</a> to add some.</div> <div style="overflow:auto;"><table style="width:100%; border-collapse:collapse;"><thead style="text-align:left; border-bottom:1px solid var(--color-border);"><tr><th style="padding:.5rem">Date</th><th style="padding:.5rem">Start Time</th><th style="padding:.5rem">End Time</th><th style="padding:.5rem">Preview</th></tr></thead><tbody id="appointments-tbody"></tbody></table></div> <div style="margin-top:1rem;"><button id="download-bottom" style="padding:.5rem .75rem; border-radius:6px; background:var(--color-primary); color:var(--color-primary-foreground); border:none; cursor:pointer; display:flex; gap:.5rem; align-items:center;" aria-label="Download ICS"><span class="material-icons" aria-hidden="true">download</span>Download ICS File</button></div> <script>
    document.addEventListener('DOMContentLoaded', function () {
      const sortSelect = document.getElementById('sort');
      const tbody = document.getElementById('appointments-tbody');
      const noDataDiv = document.getElementById('no-data');
      const downloadTop = document.getElementById('download-top');
      const downloadBottom = document.getElementById('download-bottom');

      let appointments = [];

      function loadAppointments() {
        const raw = localStorage.getItem('appointments');
        if (!raw) return [];
        try {
          return JSON.parse(raw);
        } catch (e) {
          return [];
        }
      }

      function render() {
        tbody.innerHTML = '';
        if (!appointments.length) {
          noDataDiv.style.display = 'block';
          downloadTop.disabled = downloadBottom.disabled = true;
          return;
        }
        noDataDiv.style.display = 'none';
        downloadTop.disabled = downloadBottom.disabled = false;
        for (let i = 0; i < appointments.length; i++) {
          const a = appointments[i];
          const tr = document.createElement('tr');
          tr.innerHTML = \`
            <td style="padding:.5rem">\${a.date}</td>
            <td style="padding:.5rem">\${a.startTime}</td>
            <td style="padding:.5rem">\${a.endTime}</td>
            <td style="padding:.5rem">\${formatPreview(a)}</td>
          \`;
          tbody.appendChild(tr);
        }
      }

      function formatPreview(a) {
        // produce: "Appointment on January 10, 2026 from 09:00 to 10:30"
        const [y, m, d] = a.date.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        const dateStr = dt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        return \`Appointment on \${dateStr} from \${a.startTime} to \${a.endTime}\`;
      }

      function sortAppointments(order = 'asc') {
        appointments.sort((a, b) => {
          const t1 = dateTimeKey(a);
          const t2 = dateTimeKey(b);
          return order === 'asc' ? t1 - t2 : t2 - t1;
        });
      }

      function dateTimeKey(a) {
        // produce a comparable number from date and startTime
        const [y, m, d] = a.date.split('-').map(Number);
        const [hh, mm] = a.startTime.split(':').map(Number);
        return Date.UTC(y, m - 1, d, hh, mm, 0);
      }

      function generateICS(arr) {
        const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//text-to-ics//EN'];
        for (let i = 0; i < arr.length; i++) {
          const a = arr[i];
          const uid = \`\${Date.now()}-\${i}@txt-to-ics\`;
          const [y, m, d] = a.date.split('-').map(Number);
          const [sh, sm] = a.startTime.split(':').map(Number);
          const [eh, em] = a.endTime.split(':').map(Number);
          const dtStart = new Date(Date.UTC(y, m - 1, d, sh, sm, 0));
          const dtEnd = new Date(Date.UTC(y, m - 1, d, eh, em, 0));
          lines.push('BEGIN:VEVENT');
          lines.push(\`UID:\${uid}\`);
          lines.push(\`SUMMARY:Appointment\`);
          lines.push(\`DTSTAMP:\${formatICSDate(new Date())}\`);
          lines.push(\`DTSTART:\${formatICSDate(dtStart)}\`);
          lines.push(\`DTEND:\${formatICSDate(dtEnd)}\`);
          lines.push('END:VEVENT');
        }
        lines.push('END:VCALENDAR');
        return lines.join('\\r\\n');
      }

      function formatICSDate(d) {
        const pad = (n) => String(n).padStart(2, '0');
        return d.getUTCFullYear()
          + pad(d.getUTCMonth() + 1)
          + pad(d.getUTCDate())
          + 'T'
          + pad(d.getUTCHours())
          + pad(d.getUTCMinutes())
          + pad(d.getUTCSeconds())
          + 'Z';
      }

      function downloadICS() {
        if (!appointments.length) return alert('No appointments to download.');
        const ics = generateICS(appointments);
        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'appointments.ics';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }

      // init
      appointments = loadAppointments();
      sortAppointments('asc');
      render();

      sortSelect.addEventListener('change', () => {
        sortAppointments(sortSelect.value);
        render();
      });

      downloadTop.addEventListener('click', downloadICS);
      downloadBottom.addEventListener('click', downloadICS);
    });
  <\/script></section>`));function E(p){var n=h(),a=e(t(n),2),i=t(a),s=e(t(i),2),r=t(s);r.value=r.__value="asc";var l=e(r);l.value=l.__value="desc",o(s),o(i),d(2),o(a);var m=e(a,2),c=e(t(m));d(),o(m),d(6),o(n),g(()=>f(c,"href",`${v??""}/`)),y(p,n)}export{E as component};
