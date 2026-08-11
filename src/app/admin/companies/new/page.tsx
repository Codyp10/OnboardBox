import { createCompanyAction } from "@/lib/actions";
import { listServices } from "@/lib/data/companies";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function NewCompanyPage() {
  const services = await listServices();

  return (
    <div>
      <PageHeader
        title="Create client"
        description="Enter company details, select services, and generate suggested onboarding steps."
      />
      <Panel className="ob-fade-up">
        <form action={createCompanyAction} className="space-y-5">
          <label className="block text-sm">
            <span className="font-semibold">Company name *</span>
            <input
              name="name"
              required
              className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-semibold">Legal name</span>
              <input
                name="legal_name"
                className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Website</span>
              <input
                name="website"
                className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Primary contact email</span>
              <input
                name="primary_contact_email"
                type="email"
                className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Primary contact phone</span>
              <input
                name="primary_contact_phone"
                className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Primary location name</span>
              <input
                name="location_name"
                defaultValue="Primary Location"
                className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="font-semibold">City</span>
                <input
                  name="city"
                  className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold">State</span>
                <input
                  name="state"
                  className="mt-1 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
                />
              </label>
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold">Purchased services</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {services.map((service) => (
                <label
                  key={service.id}
                  className="flex items-start gap-2 rounded-[10px] border border-ob-stone-300 px-3 py-2 text-sm"
                >
                  <input type="checkbox" name="serviceIds" value={service.id} />
                  <span>
                    <span className="font-medium">{service.name}</span>
                    <span className="block text-ob-ink-muted">
                      {service.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="approvals_enabled" />
            Enable approvals workflow for this client
          </label>

          <Button type="submit">Create company & generate onboarding</Button>
        </form>
      </Panel>
    </div>
  );
}
