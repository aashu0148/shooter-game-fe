function useFilePicker() {
  function openPicker(
    allowedFileTypes: string[] = ["png", "jpg", "jpeg", "webp", "gif", "svg"],
    isMultiple = false
  ): Promise<File[] | null> {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = allowedFileTypes
      .map((e) => (e.startsWith(".") ? e : "." + e))
      .join(",");

    if (isMultiple) input.multiple = true;

    input.click();

    return new Promise((resolve) => {
      input.addEventListener("change", (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files) {
          resolve(Array.from(target.files));
        }
      });

      function handleWindowFocus() {
        window.removeEventListener("focus", handleWindowFocus);

        setTimeout(() => {
          resolve(null);
        }, 400);
      }
      window.addEventListener("focus", handleWindowFocus);
    });
  }

  return { openPicker };
}

export default useFilePicker;
