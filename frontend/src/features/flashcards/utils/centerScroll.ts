export function centerScrollToChild(container: HTMLElement, child: HTMLElement, behavior: ScrollBehavior = 'smooth') {
  const containerCenter = container.clientWidth / 2;
  const childCenter = child.offsetLeft + child.clientWidth / 2;
  const targetScrollLeft = Math.max(0, childCenter - containerCenter);
  container.scrollTo({ left: targetScrollLeft, behavior });
}


