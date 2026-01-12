<script setup lang="ts">
import { ref } from 'vue'
import { UserPlus, X, Users, Mail, Phone } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Badge from '@/components/ui/Badge.vue'

type InternalRole = 'president' | 'secretaire' | 'tresorier' | 'membre'

interface TeamMember {
  id: string
  name: string
  phone: string
  email?: string
  role: InternalRole
}

interface Props {
  members: TeamMember[]
  structureType: 'coopérative' | 'association' | 'union' | 'fédération' | 'interprofession'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:members': [members: TeamMember[]]
}>()

const ROLE_LABELS: Record<InternalRole, string> = {
  president: 'Président',
  secretaire: 'Secrétaire',
  tresorier: 'Trésorier',
  membre: 'Membre',
}

const ROLE_DESCRIPTIONS: Record<InternalRole, string> = {
  president: 'Accès total avec tous les droits de gestion',
  secretaire: 'Lecture et vente',
  tresorier: 'Lecture, vente et gestion financière',
  membre: 'Lecture uniquement',
}

const roleOptions = [
  { value: 'secretaire', label: 'Secrétaire' },
  { value: 'tresorier', label: 'Trésorier' },
  { value: 'membre', label: 'Membre' },
]

const newMember = ref({
  name: '',
  phone: '',
  email: '',
  role: 'secretaire' as InternalRole,
})

const showAddForm = ref(false)

function addMember() {
  if (!newMember.value.name.trim() || !newMember.value.phone.trim()) {
    toast.error('Le nom et le téléphone sont obligatoires')
    return
  }

  if (newMember.value.role === 'president') {
    toast.error("Il ne peut y avoir qu'un seul président (vous-même)")
    return
  }

  const member: TeamMember = {
    id: Date.now().toString(),
    name: newMember.value.name.trim(),
    phone: newMember.value.phone.trim(),
    email: newMember.value.email.trim() || undefined,
    role: newMember.value.role,
  }

  emit('update:members', [...props.members, member])
  newMember.value = {
    name: '',
    phone: '',
    email: '',
    role: 'secretaire',
  }
  showAddForm.value = false
  toast.success('Membre ajouté avec succès')
}

function removeMember(id: string) {
  emit('update:members', props.members.filter((m) => m.id !== id))
  toast.success('Membre retiré')
}

function cancelAddForm() {
  showAddForm.value = false
  newMember.value = {
    name: '',
    phone: '',
    email: '',
    role: 'secretaire',
  }
}

function getRoleColor(role: InternalRole): string {
  switch (role) {
    case 'president':
      return 'bg-primary text-primary-foreground'
    case 'secretaire':
      return 'bg-blue-500 text-white'
    case 'tresorier':
      return 'bg-orange-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-primary mb-2">Équipe de direction</h2>
      <p class="text-sm text-muted-foreground">
        Ajoutez les membres de votre équipe et définissez leurs rôles
      </p>
    </div>

    <!-- Président (créateur) -->
    <div class="bg-muted/50 p-4 rounded-lg border-2 border-primary/20">
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3 flex-1">
          <div class="bg-primary text-primary-foreground rounded-full p-2 mt-1">
            <Users class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <p class="font-medium">Vous (Créateur)</p>
              <Badge class="bg-primary text-primary-foreground">
                Président
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              Accès total avec tous les droits de gestion
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des membres ajoutés -->
    <div v-if="members.length > 0" class="space-y-3">
      <Label>Membres invités ({{ members.length }})</Label>
      <div
        v-for="member in members"
        :key="member.id"
        class="bg-background border rounded-lg p-4 hover:border-primary/50 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-2">
              <p class="font-medium">{{ member.name }}</p>
              <Badge :class="getRoleColor(member.role)">
                {{ ROLE_LABELS[member.role] }}
              </Badge>
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone class="w-4 h-4" />
                <span>{{ member.phone }}</span>
              </div>
              <div v-if="member.email" class="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail class="w-4 h-4" />
                <span>{{ member.email }}</span>
              </div>
            </div>
            <p class="text-xs text-muted-foreground">
              {{ ROLE_DESCRIPTIONS[member.role] }}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            class="text-destructive hover:text-destructive hover:bg-destructive/10"
            @click="removeMember(member.id)"
          >
            <X class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Formulaire d'ajout de membre -->
    <div v-if="showAddForm" class="border rounded-lg p-4 space-y-4 bg-muted/30">
      <div class="flex items-center justify-between">
        <Label>Nouveau membre</Label>
        <Button
          variant="ghost"
          size="sm"
          @click="cancelAddForm"
        >
          <X class="w-4 h-4" />
        </Button>
      </div>

      <div class="space-y-2">
        <Label for="memberName">Nom complet *</Label>
        <Input
          id="memberName"
          v-model="newMember.name"
          placeholder="Ex: Kouassi Jean"
        />
      </div>

      <div class="space-y-2">
        <Label for="memberPhone">Numéro de téléphone *</Label>
        <div class="relative">
          <Phone class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="memberPhone"
            v-model="newMember.phone"
            placeholder="Ex: +225 07 XX XX XX XX"
            class="pl-10"
          />
        </div>
      </div>

      <div class="space-y-2">
        <Label for="memberEmail">Email (optionnel)</Label>
        <div class="relative">
          <Mail class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="memberEmail"
            v-model="newMember.email"
            type="email"
            placeholder="Ex: jean@example.com"
            class="pl-10"
          />
        </div>
      </div>

      <div class="space-y-2">
        <Label for="memberRole">Rôle dans la {{ structureType }} *</Label>
        <Select
          v-model="newMember.role"
          :options="roleOptions"
        />
        <p class="text-xs text-muted-foreground">
          {{ ROLE_DESCRIPTIONS[newMember.role] }}
        </p>
      </div>

      <Button class="w-full" @click="addMember">
        <UserPlus class="w-4 h-4 mr-2" />
        Ajouter ce membre
      </Button>
    </div>

    <!-- Bouton pour afficher le formulaire -->
    <Button
      v-else
      variant="outline"
      class="w-full border-dashed border-2"
      @click="showAddForm = true"
    >
      <UserPlus class="w-4 h-4 mr-2" />
      Ajouter un membre
    </Button>

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p class="text-sm text-blue-900">
        <strong>Note :</strong> Les membres ajoutés recevront un SMS d'invitation pour rejoindre la {{ structureType }} sur TITRA. Ils devront créer un compte s'ils n'en ont pas déjà un.
      </p>
    </div>
  </div>
</template>
