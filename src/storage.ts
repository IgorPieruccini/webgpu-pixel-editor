function openDB(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);

    // version change
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(`${name}-layer-0`)) {
        db.createObjectStore(`${name}-layer-0`);
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export const localDataBase = async (name: string) => {
  const db = await openDB(name);

  async function save(buffer: Uint32Array<ArrayBuffer>): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(`${name}-layer-0`, "readwrite");
      const store = tx.objectStore(`${name}-layer-0`);
      const bufferCopy = new Uint32Array(buffer);
      store.put(bufferCopy, "PixelArt");
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject((e.target as IDBRequest).error);
    });
  }

  async function load(): Promise<Uint32Array<ArrayBuffer>> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(`${name}-layer-0`, "readonly");
      const store = tx.objectStore(`${name}-layer-0`);
      const request = store.get("PixelArt");

      request.onsuccess = (e) =>
        resolve((e.target as IDBRequest).result as Uint32Array<ArrayBuffer>);
      request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
  }

  return {
    save,
    load,
  };
};
