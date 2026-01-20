// Script de diagnóstico completo del sistema
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-000a47d9`;

export async function diagnosticarSistema() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA\n');
  console.log('='.repeat(50));

  try {
    // 1. Verificar usuarios
    console.log('\n1️⃣ USUARIOS EN SUPABASE:');
    const usersRes = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const usersData = await usersRes.json();
    console.log('Total usuarios:', usersData.users?.length || 0);
    usersData.users?.forEach((u: any) => {
      console.log(`  - ${u.name} (${u.email})`);
      console.log(`    Role: ${u.role}`);
      console.log(`    Password: ${u.password}`);
    });

    // 2. Verificar solicitudes
    console.log('\n2️⃣ SOLICITUDES DE CONTRASEÑA:');
    const requestsRes = await fetch(`${API_URL}/password-requests`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const requestsData = await requestsRes.json();
    console.log('Total solicitudes:', requestsData.requests?.length || 0);
    requestsData.requests?.forEach((r: any) => {
      console.log(`  - ${r.name} (${r.email})`);
      console.log(`    Estado: ${r.status}`);
      if (r.generatedPassword) {
        console.log(`    Password generada: ${r.generatedPassword}`);
      }
    });

    // 3. Verificar nadadores
    console.log('\n3️⃣ FICHAS DE NADADORES:');
    const swimmersRes = await fetch(`${API_URL}/swimmers`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    const swimmersData = await swimmersRes.json();
    console.log('Total nadadores:', swimmersData.swimmers?.length || 0);
    swimmersData.swimmers?.forEach((s: any) => {
      console.log(`  - ${s.name} (${s.email})`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('✅ Diagnóstico completado\n');

    return {
      users: usersData.users || [],
      requests: requestsData.requests || [],
      swimmers: swimmersData.swimmers || []
    };
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    throw error;
  }
}

export async function testLogin(email: string, password: string) {
  console.log('\n🧪 TEST DE LOGIN:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  
  try {
    // Buscar usuario
    const response = await fetch(`${API_URL}/users/find-by-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      console.error('❌ Usuario no encontrado');
      return;
    }

    const { user } = await response.json();
    console.log('✅ Usuario encontrado:', user.email);
    console.log('Password en DB:', user.password);
    console.log('Password ingresada:', password);
    console.log('¿Coinciden?', user.password === password ? '✅ SÍ' : '❌ NO');

    if (user.password !== password) {
      console.log('\n🔑 PASSWORD CORRECTA PARA ESTE USUARIO:');
      console.log(user.password);
      console.log('\nCopia esta contraseña y úsala para hacer login');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}
