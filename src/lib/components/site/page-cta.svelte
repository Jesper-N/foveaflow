<script lang="ts">
  let {
    title,
    body,
    href,
    label,
  }: { title: string; body: string; href: string; label: string } = $props();
</script>

<!-- Closing call to action at the end of a page. -->
<section>
  <h2>{title}</h2>
  <p>{body}</p>
  <a {href}>{label}</a>
</section>
