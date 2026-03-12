interface StructuredDataServerProps {
  data: object | object[];
  id?: string;
}

export function StructuredDataServer({ data, id = 'structured-data' }: StructuredDataServerProps) {
  const jsonLd = Array.isArray(data) ? data : [data];
  
  return (
    <>
      {jsonLd.map((item, index) => (
        <script
          key={`${id}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
