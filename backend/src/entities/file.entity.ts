import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../users/user.entity";

@Entity("files")
export class File {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "original_name" })
  originalName: string;

  @Column({ name: "stored_name" })
  storedName: string;

  @Column({ type: "bigint" })
  size: number;

  @Column({ name: "mime_type" })
  mimeType: string;

  @Column({ unique: true })
  token: string;

  @Column({ name: "password_hash", nullable: true })
  passwordHash: string | null;

  @Column({ name: "expires_at", type: "timestamp" })
  expiresAt: Date;

  @ManyToOne(() => User, (user) => user.files, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id" })
  userId: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
