import { format, subDays, addDays, isValid, parseISO } from "date-fns";
import { formatINR } from "@/lib/utils";
import { getStoreSettings, isGstConfigured } from "@/lib/db/settings-queries";
import { getGstSalesRegister, getGstHsnSummary, getChannelBreakdown } from "@/lib/db/tax-queries";
import { GstSettingsForm } from "@/components/admin/tax/GstSettingsForm";
import { DateRangePicker } from "@/components/admin/reports/DateRangePicker";
import { DownloadCsvButton } from "@/components/admin/reports/DownloadCsvButton";
import { BreakdownDonutChart } from "@/components/admin/charts/BreakdownDonutChart";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function resolveRange(from?: string, to?: string) {
  const parsedFrom = from ? parseISO(from) : undefined;
  const parsedTo = to ? parseISO(to) : undefined;
  const validFrom = parsedFrom && isValid(parsedFrom) ? parsedFrom : subDays(new Date(), 30);
  const validTo = parsedTo && isValid(parsedTo) ? parsedTo : new Date();
  return {
    fromStr: format(validFrom, "yyyy-MM-dd"),
    toStr: format(validTo, "yyyy-MM-dd"),
    start: validFrom,
    end: addDays(validTo, 1),
  };
}

const channelLabel: Record<string, string> = { direct: "Direct", amazon: "Amazon", flipkart: "Flipkart", meesho: "Meesho" };

export default async function AdminTaxPage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const { fromStr, toStr, start, end } = resolveRange(searchParams.from, searchParams.to);
  const settings = await getStoreSettings();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="h-display text-2xl text-charcoal">Tax / GST</h1>
          <p className="text-sm text-muted">GST sales register, HSN summary, and channel breakdown for your CA.</p>
        </div>
        {isGstConfigured(settings) && <DateRangePicker from={fromStr} to={toStr} />}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-display text-lg text-charcoal">GST Settings</h3>
          {!isGstConfigured(settings) && (
            <p className="mt-1 text-sm text-muted">
              Fill these in first — the sales register and HSN summary below won&apos;t appear until every field is
              set, so nothing gets generated against an unconfigured 0% rate by mistake.
            </p>
          )}
          <div className="mt-4">
            <GstSettingsForm settings={settings} />
          </div>
        </CardContent>
      </Card>

      {isGstConfigured(settings) && (
        <TaxReports range={{ start, end }} settings={settings} fromStr={fromStr} toStr={toStr} />
      )}
    </div>
  );
}

async function TaxReports({
  range,
  settings,
  fromStr,
  toStr,
}: {
  range: { start: Date; end: Date };
  settings: { gstState: string; gstRatePercent: number; defaultHsnCode: string };
  fromStr: string;
  toStr: string;
}) {
  const [register, hsnSummary, channelBreakdown] = await Promise.all([
    getGstSalesRegister(range, settings),
    getGstHsnSummary(range, settings),
    getChannelBreakdown(range),
  ]);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-charcoal">Sales Register</h3>
            <DownloadCsvButton
              filename={`gst-sales-register-${fromStr}-to-${toStr}.csv`}
              rows={register}
              columns={[
                { key: "orderNumber", label: "Order #" },
                { key: "date", label: "Date" },
                { key: "channel", label: "Channel" },
                { key: "customerName", label: "Customer" },
                { key: "state", label: "State" },
                { key: "taxableValue", label: "Taxable Value" },
                { key: "cgst", label: "CGST" },
                { key: "sgst", label: "SGST" },
                { key: "igst", label: "IGST" },
                { key: "total", label: "Total" },
              ]}
            />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted">
                  <th className="pb-2">Order</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Channel</th>
                  <th className="pb-2">State</th>
                  <th className="pb-2 text-right">Taxable</th>
                  <th className="pb-2 text-right">CGST</th>
                  <th className="pb-2 text-right">SGST</th>
                  <th className="pb-2 text-right">IGST</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {register.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-sm text-muted">
                      No taxable orders in this period.
                    </td>
                  </tr>
                )}
                {register.map((r) => (
                  <tr key={r.orderNumber}>
                    <td className="py-2 text-charcoal">{r.orderNumber}</td>
                    <td className="py-2 text-charcoal">{r.date}</td>
                    <td className="py-2 text-charcoal">{channelLabel[r.channel]}</td>
                    <td className="py-2 text-charcoal">{r.state}</td>
                    <td className="py-2 text-right text-charcoal">{formatINR(r.taxableValue)}</td>
                    <td className="py-2 text-right text-charcoal">{formatINR(r.cgst)}</td>
                    <td className="py-2 text-right text-charcoal">{formatINR(r.sgst)}</td>
                    <td className="py-2 text-right text-charcoal">{formatINR(r.igst)}</td>
                    <td className="py-2 text-right font-medium text-charcoal">{formatINR(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-charcoal">HSN-wise Summary</h3>
            <DownloadCsvButton
              filename={`gst-hsn-summary-${fromStr}-to-${toStr}.csv`}
              rows={hsnSummary}
              columns={[
                { key: "hsnCode", label: "HSN Code" },
                { key: "taxableValue", label: "Taxable Value" },
                { key: "cgst", label: "CGST" },
                { key: "sgst", label: "SGST" },
                { key: "igst", label: "IGST" },
                { key: "totalTax", label: "Total Tax" },
              ]}
            />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted">
                  <th className="pb-2">HSN Code</th>
                  <th className="pb-2 text-right">Taxable Value</th>
                  <th className="pb-2 text-right">CGST</th>
                  <th className="pb-2 text-right">SGST</th>
                  <th className="pb-2 text-right">IGST</th>
                  <th className="pb-2 text-right">Total Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {hsnSummary.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-sm text-muted">
                      No taxable orders in this period.
                    </td>
                  </tr>
                )}
                {hsnSummary.map((r) => (
                  <tr key={r.hsnCode}>
                    <td className="py-2 text-charcoal">{r.hsnCode}</td>
                    <td className="py-2 text-right text-charcoal">{formatINR(r.taxableValue)}</td>
                    <td className="py-2 text-right text-charcoal">{formatINR(r.cgst)}</td>
                    <td className="py-2 text-right text-charcoal">{formatINR(r.sgst)}</td>
                    <td className="py-2 text-right text-charcoal">{formatINR(r.igst)}</td>
                    <td className="py-2 text-right font-medium text-charcoal">{formatINR(r.totalTax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-charcoal">Channel Breakdown</h3>
            <DownloadCsvButton
              filename={`channel-breakdown-${fromStr}-to-${toStr}.csv`}
              rows={channelBreakdown}
              columns={[
                { key: "channel", label: "Channel" },
                { key: "orderCount", label: "Orders" },
                { key: "revenue", label: "Revenue" },
              ]}
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {channelBreakdown.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted">No orders in this period.</p>
            ) : (
              <BreakdownDonutChart data={channelBreakdown.map((c) => ({ label: channelLabel[c.channel], value: c.revenue }))} />
            )}
            <ul className="flex flex-col divide-y divide-border">
              {channelBreakdown.map((c) => (
                <li key={c.channel} className="flex items-center justify-between py-3 text-sm">
                  <p className="font-medium text-charcoal">{channelLabel[c.channel]}</p>
                  <p className="text-xs text-muted">
                    {c.orderCount} order{c.orderCount === 1 ? "" : "s"} · {formatINR(c.revenue)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
