import { expect, test } from '@playwright/test'

test('approved parent signs in, restores the session, and signs out locally', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByLabel('Numéro de téléphone').fill('+32470000001')
  await page.getByRole('button', { name: 'Recevoir le code' }).click()

  await expect(
    page.getByRole('heading', { name: 'Entrez votre code' }),
  ).toBeVisible()
  await page.getByLabel('Code à six chiffres').fill('123456')
  await page.getByRole('button', { name: 'Se connecter' }).click()

  await expect(
    page.getByRole('heading', { name: 'Bonjour Parent Test' }),
  ).toBeVisible()
  await expect(page.getByText('Enfant Test')).toBeVisible()

  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Bonjour Parent Test' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Se déconnecter' }).click()
  await expect(page.getByLabel('Numéro de téléphone')).toBeVisible()
})
