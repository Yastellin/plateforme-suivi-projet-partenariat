// @vitest-environment jsdom
import { AxiosError, type AxiosAdapter } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/lib/api-client";

const endpoint = "/documents/document-test/telecharger";

describe("téléchargement documentaire via le client API", () => {
  let adaptateurInitial: typeof apiClient.defaults.adapter;

  beforeEach(() => {
    adaptateurInitial = apiClient.defaults.adapter;
  });

  afterEach(() => {
    apiClient.defaults.adapter = adaptateurInitial;
    vi.restoreAllMocks();
  });

  it("renvoie le Blob du document en cas de succès", async () => {
    const adaptateur = vi.fn<AxiosAdapter>(async (configuration) => ({
      data: new Blob(["contenu du document"], { type: "application/pdf" }),
      status: 200,
      statusText: "OK",
      headers: {},
      config: configuration,
    }));
    apiClient.defaults.adapter = adaptateur;

    const reponse = await apiClient.get<Blob>(endpoint, {
      responseType: "blob",
    });

    expect(reponse.data).toBeInstanceOf(Blob);
    expect(await reponse.data.text()).toBe("contenu du document");
    expect(adaptateur).toHaveBeenCalledWith(
      expect.objectContaining({ url: endpoint, responseType: "blob" }),
    );
  });

  it("décode le message JSON d’une erreur Blob du téléchargement", async () => {
    apiClient.defaults.adapter = (async (configuration) => {
      const reponse = {
        data: new Blob([JSON.stringify({ message: "Document introuvable." })], {
          type: "application/json",
        }),
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: configuration,
      };
      throw new AxiosError(
        "Request failed with status code 404",
        "ERR_BAD_REQUEST",
        configuration,
        undefined,
        reponse,
      );
    }) as AxiosAdapter;

    await expect(
      apiClient.get(endpoint, { responseType: "blob" }),
    ).rejects.toThrow("Document introuvable.");
  });
});
