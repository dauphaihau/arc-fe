export default defineEventHandler(async (event) => {
  const { ipDataKey } = useRuntimeConfig(event);
  return await $fetch(`https://api.ipdata.co?api-key=${ipDataKey}`);
});
