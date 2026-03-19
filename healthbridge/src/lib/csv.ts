type CsvRow = Record<string, string | number | boolean | null | undefined>;

function escapeCell(value: string) {
    if (value.includes("\"") || value.includes(",") || value.includes("\n")) {
        return `"${value.replace(/"/g, "\"\"")}"`;
    }
    return value;
}

export function toCsv(rows: CsvRow[]) {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const lines = [headers.join(",")];
    rows.forEach((row) => {
        const line = headers
            .map((header) => {
                const raw = row[header];
                const value = raw === null || raw === undefined ? "" : String(raw);
                return escapeCell(value);
            })
            .join(",");
        lines.push(line);
    });
    return lines.join("\n");
}

export function downloadCsv(filename: string, rows: CsvRow[]) {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
