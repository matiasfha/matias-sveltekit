<script lang="ts">
	import { t } from '$lib/translations';
</script>

<div
	class=" border-purple rounded-md border-t-4 w-2/4 mt-0 mx-auto px-12 py-8 flex flex-col items-center justify-center shadow-md mb-20 dark:bg-ebony-clay-500"
>
	<h3 class="p-0 !my-0">{$t('common.pricing.title')}</h3>

	<p class="text-5xl !mb-0 !py-4">$100 <strong>USD</strong></p>

	<ul class="font-body !m-0 !p-0 w-full">
		<li>✅ {$t('common.pricing.exclusivity')}</li>
		<li>✅ {$t('common.pricing.includes')}</li>
	</ul>

	<a
		href="mailto:sponsor@matiashernandez.dev"
		class="bg-purple hover:bg-purple-500 p-4 !text-gray-100 rounded-md">Contactar a ventas</a
	>
</div>
