import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não estão definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBuckets() {
  console.log('🔧 Configurando buckets no Supabase...\n');

  const buckets = [
    {
      name: 'checklist-photos',
      public: true,
      description: 'Fotos dos checklists de segurança'
    },
    {
      name: 'checklist-pdfs',
      public: true,
      description: 'PDFs dos relatórios de checklist'
    }
  ];

  for (const bucket of buckets) {
    try {
      console.log(`📦 Criando bucket: ${bucket.name}...`);
      
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`✅ Bucket "${bucket.name}" já existe`);
        } else {
          console.error(`❌ Erro ao criar bucket "${bucket.name}":`, error.message);
        }
      } else {
        console.log(`✅ Bucket "${bucket.name}" criado com sucesso`);
      }
    } catch (err) {
      console.error(`❌ Erro inesperado ao criar bucket "${bucket.name}":`, err);
    }
  }

  console.log('\n✨ Configuração de buckets concluída!');
  console.log('\n📝 Próximos passos:');
  console.log('1. Verifique se os buckets foram criados no Supabase Dashboard');
  console.log('2. Certifique-se de que os buckets estão configurados como públicos');
  console.log('3. Reinicie o servidor de desenvolvimento');
}

setupBuckets();
