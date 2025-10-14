'use client';

interface Integration {
  name: string;
  logo?: string;
  bgColor?: string;
}

interface IntegrationGridProps {
  title?: string;
  subtitle?: string;
}

export function IntegrationGrid({ title, subtitle }: IntegrationGridProps) {
  const integrations: Integration[] = [
    { name: 'HubSpot', bgColor: 'bg-orange-100' },
    { name: 'Salesforce', bgColor: 'bg-blue-100' },
    { name: 'Zoho CRM', bgColor: 'bg-red-100' },
    { name: 'Google Calendar', bgColor: 'bg-green-100' },
    { name: 'Facebook', bgColor: 'bg-blue-100' },
    { name: 'Instagram', bgColor: 'bg-pink-100' },
    { name: 'LinkedIn', bgColor: 'bg-blue-100' },
    { name: 'Zapier', bgColor: 'bg-orange-100' },
    { name: 'Mailchimp', bgColor: 'bg-yellow-100' },
    { name: 'Stripe', bgColor: 'bg-purple-100' },
    { name: 'Slack', bgColor: 'bg-purple-100' },
    { name: 'Twilio', bgColor: 'bg-red-100' },
  ];

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-[1.5rem] font-semibold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base font-normal text-gray-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="group p-6 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:border-blue-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-16 h-16 rounded-lg ${integration.bgColor || 'bg-gray-100'} flex items-center justify-center`}
              >
                <span className="text-sm font-semibold text-gray-700 text-center">
                  {integration.name.split(' ')[0].substring(0, 3)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
