import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import App from './App'
import type { AuthService, ProfileService, Session } from './services/types'

test('SC-1 approved parent requests a local code', async () => {
  const user = userEvent.setup()
  const requestOtp = vi.fn().mockResolvedValue(undefined)
  const services = {
    auth: {
      subscribe: (listener: (session: null) => void) => {
        listener(null)
        return () => undefined
      },
      requestOtp,
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    },
    profiles: {
      getCurrent: vi.fn(),
    },
  }

  render(<App services={services} />)

  await user.type(screen.getByLabelText('Numéro de téléphone'), '+32470000001')
  await user.click(screen.getByRole('button', { name: 'Recevoir le code' }))

  expect(requestOtp).toHaveBeenCalledExactlyOnceWith('+32470000001')
  expect(
    await screen.findByRole('heading', { name: 'Entrez votre code' }),
  ).toBeInTheDocument()
})

test('SC-2 unknown phone number is refused without leaving phone entry', async () => {
  const user = userEvent.setup()
  const requestOtp = vi.fn().mockRejectedValue(new Error('Signups not allowed'))
  const services = createSignedOutServices(requestOtp)

  render(<App services={services} />)

  await user.type(screen.getByLabelText('Numéro de téléphone'), '+32479999999')
  await user.click(screen.getByRole('button', { name: 'Recevoir le code' }))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Impossible d'envoyer le code",
  )
  expect(screen.getByLabelText('Numéro de téléphone')).toBeInTheDocument()
})

test('SC-3 invalid phone syntax is rejected before authentication', async () => {
  const user = userEvent.setup()
  const requestOtp = vi.fn().mockResolvedValue(undefined)
  const services = createSignedOutServices(requestOtp)

  render(<App services={services} />)

  await user.type(screen.getByLabelText('Numéro de téléphone'), '0470 00 00 01')
  await user.click(screen.getByRole('button', { name: 'Recevoir le code' }))

  expect(requestOtp).not.toHaveBeenCalled()
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'format international',
  )
})

test('SC-4 and SC-6 correct OTP shows the saved parent and child', async () => {
  const user = userEvent.setup()
  let sessionListener: (session: Session | null) => void = () => undefined
  const verifyOtp = vi.fn(() => {
    sessionListener({ userId: 'parent-1' })
    return Promise.resolve()
  })
  const services = {
    auth: {
      subscribe: (listener: typeof sessionListener) => {
        sessionListener = listener
        listener(null)
        return () => undefined
      },
      requestOtp: vi.fn().mockResolvedValue(undefined),
      verifyOtp,
      signOut: vi.fn(),
    },
    profiles: {
      getCurrent: vi.fn().mockResolvedValue({
        userId: 'parent-1',
        parentName: 'Parent Test',
        children: ['Enfant Test'],
      }),
    },
  }

  render(<App services={services} />)

  await user.type(screen.getByLabelText('Numéro de téléphone'), '+32470000001')
  await user.click(screen.getByRole('button', { name: 'Recevoir le code' }))
  await user.type(await screen.findByLabelText('Code à six chiffres'), '123456')
  await user.click(screen.getByRole('button', { name: 'Se connecter' }))

  expect(verifyOtp).toHaveBeenCalledExactlyOnceWith('+32470000001', '123456')
  expect(
    await screen.findByRole('heading', { name: 'Bonjour Parent Test' }),
  ).toBeInTheDocument()
  expect(screen.getByText('Enfant Test')).toBeInTheDocument()
})

test('SC-6 renders repeated child names as separate list entries', async () => {
  const services = signedInServices(
    vi.fn().mockResolvedValue({
      userId: 'parent-1',
      parentName: 'Parent Test',
      children: ['Enfant Test', 'Enfant Test'],
    }),
  )

  render(<App services={services} />)

  expect(await screen.findAllByText('Enfant Test')).toHaveLength(2)
})

test('SC-5 wrong OTP keeps the parent on code entry with a recoverable error', async () => {
  const user = userEvent.setup()
  const services = createSignedOutServices(vi.fn().mockResolvedValue(undefined))
  services.auth.verifyOtp = vi.fn().mockRejectedValue(new Error('invalid OTP'))

  render(<App services={services} />)
  await user.type(screen.getByLabelText('Numéro de téléphone'), '+32470000001')
  await user.click(screen.getByRole('button', { name: 'Recevoir le code' }))
  await user.type(await screen.findByLabelText('Code à six chiffres'), '000000')
  await user.click(screen.getByRole('button', { name: 'Se connecter' }))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Code incorrect ou expiré',
  )
  expect(screen.getByLabelText('Code à six chiffres')).toBeInTheDocument()
})

test('SC-10 logout clears private profile state and returns to login', async () => {
  const user = userEvent.setup()
  let sessionListener: (session: Session | null) => void = () => undefined
  const getCurrent = vi.fn().mockResolvedValue({
    userId: 'parent-1',
    parentName: 'Parent Test',
    children: ['Enfant Test'],
  })
  const signOut = vi.fn(() => {
    sessionListener(null)
    return Promise.resolve()
  })
  const services = {
    auth: {
      subscribe: (listener: typeof sessionListener) => {
        sessionListener = listener
        listener({ userId: 'parent-1' })
        return () => undefined
      },
      requestOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut,
    },
    profiles: { getCurrent },
  }

  render(<App services={services} />)

  await user.click(
    await screen.findByRole('button', { name: 'Se déconnecter' }),
  )

  expect(signOut).toHaveBeenCalledOnce()
  expect(
    await screen.findByLabelText('Numéro de téléphone'),
  ).toBeInTheDocument()

  act(() => sessionListener({ userId: 'parent-1' }))
  await screen.findByRole('heading', { name: 'Bonjour Parent Test' })
  expect(getCurrent).toHaveBeenCalledTimes(2)
})

test('SC-11 failed logout remains visible and retryable', async () => {
  const user = userEvent.setup()
  const signOut = vi.fn().mockRejectedValue(new Error('temporary failure'))
  const services = signedInServices(
    vi.fn().mockResolvedValue({
      userId: 'parent-1',
      parentName: 'Parent Test',
      children: [],
    }),
  )
  services.auth.signOut = signOut

  render(<App services={services} />)
  await screen.findByRole('heading', { name: 'Bonjour Parent Test' })
  await user.click(screen.getByRole('button', { name: 'Se déconnecter' }))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Impossible de vous déconnecter',
  )
  expect(
    screen.getByRole('heading', { name: 'Bonjour Parent Test' }),
  ).toBeInTheDocument()
})

test('SC-8 and SC-11 profile failure is private and retryable', async () => {
  const user = userEvent.setup()
  const getCurrent = vi
    .fn()
    .mockRejectedValueOnce(new Error('temporary failure'))
    .mockResolvedValueOnce({
      userId: 'parent-1',
      parentName: 'Parent Test',
      children: [],
    })
  const services = signedInServices(getCurrent)

  render(<App services={services} />)
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Impossible de charger votre profil',
  )
  expect(screen.queryByText(/Bonjour/)).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Réessayer' }))
  expect(
    await screen.findByRole('heading', { name: 'Bonjour Parent Test' }),
  ).toBeInTheDocument()
})

test('SC-9 restored session waits for auth initialization before loading its profile', async () => {
  let notify: (session: Session | null) => void = () => undefined
  const services = {
    auth: {
      subscribe: (listener: typeof notify) => {
        notify = listener
        return () => undefined
      },
      requestOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    },
    profiles: {
      getCurrent: vi.fn().mockResolvedValue({
        userId: 'parent-1',
        parentName: 'Parent Test',
        children: ['Enfant Test'],
      }),
    },
  }
  render(<App services={services} />)
  expect(screen.getByText('Vérification de votre session…')).toBeInTheDocument()

  act(() => notify({ userId: 'parent-1' }))
  expect(
    await screen.findByRole('heading', { name: 'Bonjour Parent Test' }),
  ).toBeInTheDocument()
})

test('SC-10 external session loss removes cached private data before restoration', async () => {
  let notify: (session: Session | null) => void = () => undefined
  const getCurrent = vi
    .fn()
    .mockResolvedValueOnce({
      userId: 'parent-1',
      parentName: 'Private Name',
      children: [],
    })
    .mockImplementation(() => new Promise(() => undefined))
  const services = {
    auth: {
      subscribe: (listener: typeof notify) => {
        notify = listener
        listener({ userId: 'parent-1' })
        return () => undefined
      },
      requestOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    },
    profiles: { getCurrent },
  }
  render(<App services={services} />)
  await screen.findByRole('heading', { name: 'Bonjour Private Name' })
  act(() => notify(null))
  await screen.findByLabelText('Numéro de téléphone')
  act(() => notify({ userId: 'parent-1' }))
  expect(screen.queryByText('Bonjour Private Name')).not.toBeInTheDocument()
  expect(screen.getByText('Chargement de votre profil…')).toBeInTheDocument()
})

function createSignedOutServices(requestOtp: AuthService['requestOtp']) {
  return {
    auth: {
      subscribe: (listener: (session: null) => void) => {
        listener(null)
        return () => undefined
      },
      requestOtp,
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    },
    profiles: { getCurrent: vi.fn() },
  }
}

function signedInServices(getCurrent: ProfileService['getCurrent']) {
  return {
    auth: {
      subscribe: (listener: (session: Session | null) => void) => {
        listener({ userId: 'parent-1' })
        return () => undefined
      },
      requestOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    },
    profiles: { getCurrent },
  }
}
