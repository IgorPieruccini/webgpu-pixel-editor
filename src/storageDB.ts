function openDB(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);

    // version change
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(`${name}`)) {
        db.createObjectStore(`layers`);
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

  async function save(
    buffer: Uint8Array<ArrayBuffer>,
    layerId: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(`layers`, "readwrite");
      const store = tx.objectStore(`layers`);
      const bufferCopy = new Uint8Array(buffer).slice();
      store.put(bufferCopy, layerId);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject((e.target as IDBRequest).error);
    });
  }

  async function load(layerId: string): Promise<Uint8Array<ArrayBuffer>> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(`layers`, "readonly");
      const store = tx.objectStore(`layers`);
      const request = store.get(layerId);

      request.onsuccess = (e) =>
        resolve((e.target as IDBRequest).result as Uint8Array<ArrayBuffer>);
      request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
  }

  return {
    save,
    load,
  };
};
